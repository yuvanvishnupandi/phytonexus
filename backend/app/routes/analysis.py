from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional
from app.routes.auth import get_current_user, get_current_user_optional
from app.schemas import UserResponse
from app.database import get_guest_limits_collection

from app.agents.orchestrator import analyze_plant
from app.database import list_analyses
from app.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/analyze/limit-status")
async def check_limit_status(request: Request, current_user: Optional[UserResponse] = Depends(get_current_user_optional)):
    if current_user:
        return {"limit_reached": False}
    
    limits_col = get_guest_limits_collection()
    if limits_col is not None:
        ip_address = request.client.host
        guest_record = await limits_col.find_one({"ip_address": ip_address})
        if guest_record and guest_record.get("usage_count", 0) >= 1:
            return {"limit_reached": True}
            
    return {"limit_reached": False}

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: Request, body: AnalyzeRequest, current_user: Optional[UserResponse] = Depends(get_current_user_optional)):
    
    # Guest Limit Check
    if not current_user:
        limits_col = get_guest_limits_collection()
        if limits_col is not None:
            ip_address = request.client.host
            guest_record = await limits_col.find_one({"ip_address": ip_address})
            if guest_record and guest_record.get("usage_count", 0) >= 1:
                raise HTTPException(status_code=429, detail="Limit reached for the device")
            
            # Record usage
            await limits_col.update_one(
                {"ip_address": ip_address},
                {"$inc": {"usage_count": 1}},
                upsert=True
            )

    try:
        clean_base64 = body.image_base64
        if "," in clean_base64:
            clean_base64 = clean_base64.split(",", 1)[1]
        return await analyze_plant(
            clean_base64,
            body.filename or "plant-upload.jpg",
            body.mime_type or "image/jpeg",
            user_id=current_user.id if current_user else None,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/analyses")
async def analyses(limit: int = 20, current_user: UserResponse = Depends(get_current_user)):
    return {"items": await list_analyses(user_id=current_user.id, limit=limit)}
