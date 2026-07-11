import asyncio
from app.agents.lifecycle_expert import run_lifecycle_expert
from app.agents.vision_diagnostician import run_vision_diagnostician
from app.agents.multi_agents import run_pathologist, run_soil_chemist, run_botanist, run_synthesizer
from app.database import save_analysis
from app.schemas import AnalyzeResponse


DISCLAIMER = (
    "AI estimate based on visible image symptoms only. For severe crop loss, "
    "confirm with a local agricultural extension expert."
)


async def analyze_plant(image_base64: str, filename: str, mime_type: str = "image/jpeg", user_id: str = None) -> AnalyzeResponse:
    # 1. Base Vision Diagnosis
    diagnosis = await run_vision_diagnostician(image_base64, mime_type)
    
    if not diagnosis.is_plant:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="The uploaded image does not appear to be a plant. Please upload a clear photo of a plant.")
    
    # 2. Lifecycle Expert (Sequential, since it doesn't take long)
    prediction = await run_lifecycle_expert(diagnosis)

    # 3. Multi-Agent Debate (Parallel execution)
    opinions = await asyncio.gather(
        run_pathologist(diagnosis),
        run_soil_chemist(diagnosis),
        run_botanist(diagnosis)
    )
    
    # 4. Synthesizer Treatment Plan
    treatment_plan = await run_synthesizer(list(opinions), diagnosis)

    document = {
        "filename": filename,
        "mime_type": mime_type,
        "image_base64": image_base64,
        "vision_diagnosis": diagnosis.model_dump(),
        "lifecycle_prediction": prediction.model_dump(),
        "agent_debates": [op.model_dump() for op in opinions],
        "treatment_plan": treatment_plan.model_dump(),
        "disclaimer": DISCLAIMER,
    }
    analysis_id = await save_analysis(document, user_id=user_id)

    return AnalyzeResponse(
        analysis_id=analysis_id,
        filename=filename,
        vision_diagnosis=diagnosis,
        lifecycle_prediction=prediction,
        agent_debates=list(opinions),
        treatment_plan=treatment_plan,
        disclaimer=DISCLAIMER,
    )
