import json
from openai import AsyncOpenAI
from app.config import get_settings
from app.schemas import AgentOpinion, TreatmentPlan, VisionDiagnosis

async def call_llm_with_fallbacks(system_msg: str, user_msg: str, temperature: float) -> str:
    settings = get_settings()
    
    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg}
    ]
    
    last_error = None
    
    # 1. Groq (Fastest for text)
    if settings.groq_api_key:
        try:
            client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1")
            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            last_error = f"Groq failed: {e}"

    # 2. Gemini 2.5 Flash
    if settings.gemini_api_key:
        try:
            client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            response = await client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            last_error = f"Gemini 2.5 failed: {e}"
            
    # 3. Gemini 1.5 Pro
    if settings.gemini_api_key:
        try:
            client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            response = await client.chat.completions.create(
                model="gemini-1.5-pro",
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            last_error = f"Gemini 1.5 Pro failed: {e}"

    # 4. OpenAI
    if settings.openai_api_key:
        try:
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            response = await client.chat.completions.create(
                model=settings.openai_vision_model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            last_error = f"OpenAI failed: {e}"

    raise RuntimeError(f"All agents failed. Last error: {last_error}")

async def run_expert_agent(agent_name: str, agent_role: str, prompt: str, vision_data: VisionDiagnosis) -> AgentOpinion:
    system_msg = f"You are {agent_name}, a highly skilled {agent_role}. Your goal is to analyze the initial vision diagnosis and provide your expert opinion. Keep it concise, analytical, and professional."
    
    user_msg = f"""
    Initial Vision Diagnosis:
    - Species: {vision_data.likely_species}
    - Symptoms: {vision_data.symptoms}
    - Health: {vision_data.overall_health}
    - Is Dead: {vision_data.is_dead}
    - Diseases: {[d.name for d in vision_data.disease_detection]}
    - Stressors: {vision_data.environmental_stressors}
    
    {prompt}
    
    Provide your output in JSON format exactly matching this schema:
    {{
        "opinion": "Your expert analysis (1-2 paragraphs max)",
        "confidence": "low", "medium", or "high"
    }}
    """
    
    try:
        content = await call_llm_with_fallbacks(system_msg, user_msg, 0.4)
        data = json.loads(content)
        return AgentOpinion(
            agent_name=agent_name,
            agent_role=agent_role,
            opinion=data.get("opinion", "Analysis failed"),
            confidence=data.get("confidence", "low")
        )
    except Exception as e:
        return AgentOpinion(
            agent_name=agent_name,
            agent_role=agent_role,
            opinion=f"Error running agent: {e}",
            confidence="low"
        )


async def run_pathologist(vision_data: VisionDiagnosis) -> AgentOpinion:
    prompt = "Focus specifically on identifying potential fungal, bacterial, or viral infections based on the symptoms. Are there hidden signs the vision model missed or misinterpreted? Argue your case. IF the plant is flagged as 'Is Dead: True', explicitly state that pathogen analysis is irrelevant because the host is no longer viable."
    return await run_expert_agent("Dr. Thorne", "Plant Pathologist", prompt, vision_data)

async def run_soil_chemist(vision_data: VisionDiagnosis) -> AgentOpinion:
    prompt = "Focus specifically on nutrient deficiencies (NPK, micronutrients) or soil toxicity. Often, what looks like a disease is actually a severe nutrient imbalance. Argue your case based on the visible symptoms. IF the plant is flagged as 'Is Dead: True', state that while soil chemistry may have been the original cause, the plant is dead and beyond nutritional rescue."
    return await run_expert_agent("Dr. Vance", "Soil Chemist", prompt, vision_data)

async def run_botanist(vision_data: VisionDiagnosis) -> AgentOpinion:
    prompt = "Focus specifically on environmental stressors (light, water, humidity, temperature). Look at the overall structure and wilting patterns. Argue your case on whether this is an environmental issue. IF the plant is flagged as 'Is Dead: True', state clearly that environmental conditions were fatal and there is zero chance of recovery."
    return await run_expert_agent("Dr. Lin", "Lead Botanist", prompt, vision_data)


async def run_synthesizer(opinions: list[AgentOpinion], vision_data: VisionDiagnosis) -> TreatmentPlan:
    debates = "\n\n".join([f"{op.agent_name} ({op.agent_role}): {op.opinion}" for op in opinions])
    
    system_msg = "You are the Master Orchestrator. You will review the individual agent opinions and synthesize them into a highly actionable 7-day treatment plan. If the consensus or initial diagnosis clearly states the plant is DEAD, your treatment plan MUST be a 'Discard/Compost Plan' and estimated_recovery_time MUST be 'None (Dead)'."
    
    user_msg = f"""
    Initial Vision Health: {vision_data.overall_health} (Is Dead: {vision_data.is_dead})
    
    Agent Debates:
    {debates}
    
    Based on the consensus, create a structured 7-day Treatment Plan. If the plant is DEAD, skip generic watering/fertilizing steps. Instead, your daily regimen should just be a Day 1 step explaining how to safely discard/compost the plant and sanitize the pot.
    
    Provide your output in JSON format exactly matching this schema:
    {{
        "estimated_recovery_time": "e.g. 2 weeks (or 'None (Dead)')",
        "required_materials": ["list", "of", "materials"],
        "daily_regimen": [
            {{ "day": 1, "action": "Short title", "details": "Detailed instructions" }},
            {{ "day": 3, "action": "Short title", "details": "Detailed instructions" }}
        ]
    }}
    (Note: You don't need a step for every single day if it's not required, e.g., Day 1, Day 3, Day 7 is fine, but keep it structured).
    """
    
    try:
        content = await call_llm_with_fallbacks(system_msg, user_msg, 0.3)
        data = json.loads(content)
        
        return TreatmentPlan(
            estimated_recovery_time=data.get("estimated_recovery_time", "Unknown"),
            required_materials=data.get("required_materials", []),
            daily_regimen=data.get("daily_regimen", [])
        )
    except Exception as e:
        print("Synthesizer failed:", e)
        return TreatmentPlan(
            estimated_recovery_time="Unknown",
            required_materials=["Consult a professional"],
            daily_regimen=[{"day": 1, "action": "Error", "details": str(e), "completed": False}]
        )
