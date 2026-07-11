import json

from openai import AsyncOpenAI

from app.agents.json_utils import extract_json_object
from app.config import get_settings
from app.schemas import VisionDiagnosis


VISION_PROMPT = """
You are Agent 1: the Master Vision Diagnostician and Plant Pathologist.

Analyze the uploaded plant image with extreme botanical accuracy.
Identify the likely species, current growth stage, and rigorously inspect for any health symptoms.

CRITICAL INSTRUCTIONS FOR DISEASE DETECTION:
1. First, check if the image is actually a plant. If it is NOT a plant (e.g. a person, animal, random object, landscape without clear plant focus), you MUST set "is_plant" to false. Otherwise, set it to true.
2. Be highly accurate. Do NOT hallucinate diseases if the plant is healthy.
3. If NO diseases are visible, the `disease_detection` list MUST be completely empty `[]`.
4. If you detect a potential issue but are unsure, you must set the disease `confidence` to "low".
5. Use precise botanical terminology for pathogens when possible.
6. DEAD PLANT RECOGNITION: If the plant has completely desiccated (brown/crispy throughout) with absolutely no viable green tissue remaining, you MUST set `is_dead` to true and `overall_health` to "dead". Be ruthless. If it's dead, say it's dead.

Return JSON only with this exact schema:
{
  "is_plant": boolean,
  "is_dead": boolean,
  "likely_species": "string",
  "plant_type": "indoor | outdoor | crop | succulent | unknown",
  "confidence": "low | medium | high",
  "growth_stage": "string",
  "overall_health": "healthy | watch | stressed | critical | dead",
  "disease_detection": [
    {
      "name": "string",
      "severity": "low | medium | high | critical",
      "confidence": "low | medium | high"
    }
  ],
  "symptoms": ["string"],
  "possible_causes": ["string"],
  "health_observations": ["string"],
  "environmental_stressors": ["string"],
  "visible_limitations": "string"
}

If species is uncertain, explicitly state "uncertain, possibly...".
"""


async def run_vision_diagnostician(image_base64: str, mime_type: str = "image/jpeg") -> VisionDiagnosis:
    settings = get_settings()

    openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
    groq_client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1") if settings.groq_api_key else None
    
    messages = [
        {"role": "system", "content": VISION_PROMPT},
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Look at this plant image and produce the structured diagnosis JSON.",
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{image_base64}"},
                },
            ],
        },
    ]

    errors = []

    # Attempt 1: Gemini Vision (gemini-2.5-flash) - highly reliable, very high quota
    if settings.gemini_api_key:
        try:
            gemini_client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            response = await gemini_client.chat.completions.create(
                model="gemini-2.5-flash",
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return VisionDiagnosis.model_validate(extract_json_object(content))
        except Exception as e:
            errors.append(f"Gemini 2.5 Vision failed: {e}")
            
    # Attempt 2: Gemini Vision Fallback (gemini-1.5-pro) - different quota bucket
    if settings.gemini_api_key:
        try:
            gemini_client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            response = await gemini_client.chat.completions.create(
                model="gemini-1.5-pro",
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return VisionDiagnosis.model_validate(extract_json_object(content))
        except Exception as e:
            errors.append(f"Gemini 1.5 Pro Vision failed: {e}")

    # Attempt 3: Mistral Pixtral Vision
    if settings.mistral_api_key:
        try:
            mistral_client = AsyncOpenAI(api_key=settings.mistral_api_key, base_url="https://api.mistral.ai/v1")
            response = await mistral_client.chat.completions.create(
                model="pixtral-12b-2409",
                temperature=0.1,
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return VisionDiagnosis.model_validate(extract_json_object(content))
        except Exception as e:
            errors.append(f"Mistral Pixtral Vision failed: {e}")

    # Attempt 4: OpenAI Fallback (gpt-4o-mini)
    if openai_client:
        try:
            response = await openai_client.chat.completions.create(
                model=settings.openai_vision_model,
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return VisionDiagnosis.model_validate(extract_json_object(content))
        except Exception as e:
            errors.append(f"OpenAI Vision failed: {e}")

    raise RuntimeError("All vision providers failed. Errors: " + " | ".join(errors))
