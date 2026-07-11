import json

from openai import AsyncOpenAI

from app.agents.json_utils import extract_json_object
from app.config import get_settings
from app.schemas import LifecyclePrediction, VisionDiagnosis


LIFECYCLE_PROMPT = """
You are Agent 2: the Master Agricultural Lifecycle Expert and Botanist.

You cannot see the image. You must reason meticulously from Agent 1's plant diagnosis.
Predict the remaining lifespan, expected yield, and recovery probability with high precision based on the documented health state.

CRITICAL INSTRUCTIONS:
- If Agent 1 reports NO diseases and a "healthy" state, assume a healthy lifecycle. Your `action_plan` should focus on maintenance, and `recovery_probability` should be "N/A (Healthy)".
- If the plant is diseased or stressed, generate a targeted, practical 3-step action plan to rescue it. Be highly specific about the disease mentioned.
- Ensure all environmental requirements (light, water, soil) are scientifically tailored to the identified plant species.
- Provide a rigorous, realistic `prediction_timeline`.

Return JSON only with this exact schema:
{
  "remaining_life_weeks": "string",
  "yield_estimate": "string",
  "risk_level": "low | moderate | high | critical",
  "expected_yield_window": "string",
  "recovery_probability": "string",
  "prediction_timeline": [
    {
      "timeframe": "string (e.g. '1-2 weeks')",
      "expected_change": "string"
    }
  ],
  "environmental_requirements": {
    "light": "string",
    "water": "string",
    "soil_nutrients": "string"
  },
  "action_plan": ["step 1", "step 2", "step 3"],
  "monitoring_advice": "string"
}

Give cautious ranges, not fake certainty. If the plant species is uncertain, explain the uncertainty.
"""


async def run_lifecycle_expert(diagnosis: VisionDiagnosis) -> LifecyclePrediction:
    settings = get_settings()

    openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
    groq_client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1") if settings.groq_api_key else None
    mistral_client = AsyncOpenAI(api_key=settings.mistral_api_key, base_url="https://api.mistral.ai/v1") if settings.mistral_api_key else None

    messages = [
        {"role": "system", "content": LIFECYCLE_PROMPT},
        {
            "role": "user",
            "content": (
                "Agent 1 diagnosis report:\n"
                f"{json.dumps(diagnosis.model_dump(), indent=2)}"
            ),
        },
    ]

    last_error = None
    content = "{}"

    if settings.gemini_api_key:
        try:
            gemini_client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            response = await gemini_client.chat.completions.create(
                model="gemini-1.5-flash",
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return LifecyclePrediction.model_validate(extract_json_object(content))
        except Exception as e:
            last_error = f"Gemini Lifecycle failed: {e}"
            print(last_error)

    if groq_client:
        try:
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return LifecyclePrediction.model_validate(extract_json_object(content))
        except Exception as e:
            last_error = f"Groq Lifecycle failed: {e}"
            print(last_error)

    if mistral_client:
        try:
            response = await mistral_client.chat.completions.create(
                model="mistral-small-latest",
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return LifecyclePrediction.model_validate(extract_json_object(content))
        except Exception as e:
            last_error = f"Mistral Lifecycle failed: {e}"
            print(last_error)

    if openai_client:
        try:
            response = await openai_client.chat.completions.create(
                model=settings.openai_vision_model,
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = response.choices[0].message.content or "{}"
            return LifecyclePrediction.model_validate(extract_json_object(content))
        except Exception as e:
            last_error = f"OpenAI Lifecycle failed: {e}"
            print(last_error)

    raise RuntimeError(f"All lifecycle providers failed. Last error: {last_error}")

