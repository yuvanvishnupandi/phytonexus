from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import json
from app.config import get_settings

router = APIRouter(prefix="/api/encyclopedia", tags=["encyclopedia"])

class EncyclopediaResponse(BaseModel):
    title: str
    scientific_name: str
    summary: str
    history: str
    details: str

@router.get("", response_model=EncyclopediaResponse)
async def get_encyclopedia_entry(plant: str):
    settings = get_settings()
    
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing.")
        
    client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
    
    try:
        response = await client.chat.completions.create(
            model="gemini-1.5-flash",
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": """You are the PhytoNexus Botanical Encyclopedia Agent. 
Return structured knowledge about the requested plant in this exact JSON schema:
{
  "title": "Common name",
  "scientific_name": "Scientific name",
  "summary": "2-3 sentences overview",
  "history": "Historical origins, cultural significance, and discovery",
  "details": "Detailed botanical features, care requirements, and ecology"
}"""},
                {"role": "user", "content": f"Search Wikipedia and botanical databases for: {plant}"}
            ]
        )
        content = response.choices[0].message.content or "{}"
        
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
            
        data = json.loads(content)
        return EncyclopediaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to retrieve encyclopedia entry: {str(e)}")
