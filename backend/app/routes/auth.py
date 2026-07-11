import datetime
from fastapi import APIRouter, HTTPException, Depends, status, Header
from passlib.context import CryptContext
import jwt

from app.schemas import UserCreate, UserLogin, Token, UserResponse
from app.database import get_users_collection
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    settings = get_settings()
    # We use a hardcoded secret for this demo if not provided, but ideally it's in settings
    secret = "my-super-secret-jwt-key"
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret, algorithm="HS256")
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    secret = "my-super-secret-jwt-key"
    try:
        decoded_jwt = jwt.decode(token, secret, algorithms=["HS256"])
        return decoded_jwt
    except jwt.PyJWTError:
        return None

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    collection = get_users_collection()
    if collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")

    existing_user = await collection.find_one({"email": user.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email.lower(),
        "hashed_password": hashed_password,
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }

    result = await collection.insert_one(new_user)
    new_user["id"] = str(result.inserted_id)

    user_response = UserResponse(id=new_user["id"], name=new_user["name"], email=new_user["email"])
    access_token = create_access_token(data={"sub": str(new_user["id"]), "name": new_user["name"], "email": new_user["email"]})
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    collection = get_users_collection()
    if collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")

    db_user = await collection.find_one({"email": user.email.lower()})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user_response = UserResponse(id=str(db_user["_id"]), name=db_user["name"], email=db_user["email"])
    access_token = create_access_token(data={"sub": str(db_user["_id"]), "name": db_user["name"], "email": db_user["email"]})

    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    collection = get_users_collection()
    if collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")

    from bson.objectid import ObjectId
    db_user = await collection.find_one({"_id": ObjectId(payload.get("sub"))})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(id=str(db_user["_id"]), name=db_user["name"], email=db_user["email"])

async def get_current_user_optional(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    if token == "null" or token == "":
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    collection = get_users_collection()
    if collection is None:
        return None
    from bson.objectid import ObjectId
    try:
        db_user = await collection.find_one({"_id": ObjectId(payload.get("sub"))})
        if not db_user:
            return None
        return UserResponse(id=str(db_user["_id"]), name=db_user["name"], email=db_user["email"])
    except:
        return None
