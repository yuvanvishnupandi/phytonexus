from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import certifi
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings


class Database:
    client: Optional[AsyncIOMotorClient] = None


db = Database()


async def connect_to_mongo() -> None:
    settings = get_settings()
    if not settings.mongodb_uri:
        return
    db.client = AsyncIOMotorClient(settings.mongodb_uri, tlsCAFile=certifi.where())
    await db.client.admin.command("ping")


async def close_mongo_connection() -> None:
    if db.client:
        db.client.close()


def get_collection():
    settings = get_settings()
    if not db.client:
        return None
    return db.client[settings.mongodb_db_name]["analyses"]

def get_users_collection():
    settings = get_settings()
    if not db.client:
        return None
    return db.client[settings.mongodb_db_name]["users"]

def get_chats_collection():
    settings = get_settings()
    if not db.client:
        return None
    return db.client[settings.mongodb_db_name]["chats"]

def get_guest_limits_collection():
    settings = get_settings()
    if not db.client:
        return None
    return db.client[settings.mongodb_db_name]["guest_limits"]


async def save_analysis(document: Dict[str, Any], user_id: str = None) -> str:
    collection = get_collection()
    document["created_at"] = datetime.now(timezone.utc)
    if user_id:
        document["user_id"] = user_id
    if collection is None:
        return "database-disabled"
    result = await collection.insert_one(document)
    return str(result.inserted_id)


async def list_analyses(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    collection = get_collection()
    if collection is None:
        return []
    cursor = collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    rows = await cursor.to_list(length=limit)
    for row in rows:
        row["_id"] = str(row["_id"])
        if "created_at" in row:
            row["created_at"] = row["created_at"].isoformat()
    return rows

