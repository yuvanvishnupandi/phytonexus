from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    image_base64: str = Field(..., min_length=100)
    filename: Optional[str] = "plant-upload.jpg"
    mime_type: Optional[str] = "image/jpeg"


class DiseaseDetection(BaseModel):
    name: str
    severity: Literal["low", "medium", "high", "critical"]
    confidence: Literal["low", "medium", "high"]

class VisionDiagnosis(BaseModel):
    is_plant: bool = True
    likely_species: str
    plant_type: str
    confidence: Literal["low", "medium", "high"]
    growth_stage: str
    overall_health: Literal["healthy", "watch", "stressed", "critical", "dead"]
    is_dead: bool = False
    disease_detection: List[DiseaseDetection] = Field(default_factory=list)
    symptoms: List[str] = Field(default_factory=list)
    possible_causes: List[str] = Field(default_factory=list)
    health_observations: List[str] = Field(default_factory=list)
    environmental_stressors: List[str] = Field(default_factory=list)
    visible_limitations: str

    @field_validator("symptoms", "possible_causes", "health_observations", "environmental_stressors", mode="before")
    @classmethod
    def ensure_list(cls, value):
        if isinstance(value, list):
            return [str(item) for item in value if str(item).strip()]
        if value:
            return [str(value)]
        return ["None identified"]

    @field_validator("confidence", mode="before")
    @classmethod
    def normalize_confidence(cls, value):
        text = str(value).lower()
        if "high" in text:
            return "high"
        if "medium" in text or "moderate" in text:
            return "medium"
        return "low"

    @field_validator("overall_health", mode="before")
    @classmethod
    def normalize_health(cls, value):
        text = str(value).lower()
        if "dead" in text or "deceased" in text:
            return "dead"
        if "critical" in text or "severe" in text or "dying" in text:
            return "critical"
        if "stress" in text or "poor" in text:
            return "stressed"
        if "watch" in text or "moderate" in text or "fair" in text:
            return "watch"
        return "healthy"


class TimelineEvent(BaseModel):
    timeframe: str
    expected_change: str

class EnvironmentalRequirements(BaseModel):
    light: str
    water: str
    soil_nutrients: str

class LifecyclePrediction(BaseModel):
    remaining_life_weeks: str
    yield_estimate: str
    risk_level: Literal["low", "moderate", "high", "critical"]
    expected_yield_window: str
    recovery_probability: str
    prediction_timeline: List[TimelineEvent] = Field(default_factory=list)
    environmental_requirements: EnvironmentalRequirements
    action_plan: List[str] = Field(default_factory=list)
    monitoring_advice: str

    @field_validator("action_plan", mode="before")
    @classmethod
    def normalize_action_plan(cls, value):
        if not isinstance(value, list):
            value = [str(value)] if value else []
        cleaned = [str(item) for item in value if str(item).strip()]
        defaults = [
            "Improve watering consistency based on soil moisture, avoiding both drought and waterlogging.",
            "Remove badly damaged leaves and isolate the plant if pests or fungal symptoms are visible.",
            "Monitor new growth for 7 to 10 days and adjust light, nutrients, or treatment if symptoms spread.",
        ]
        return (cleaned + defaults)[:3]

    @field_validator("risk_level", mode="before")
    @classmethod
    def normalize_risk(cls, value):
        text = str(value).lower()
        if "critical" in text or "severe" in text:
            return "critical"
        if "high" in text:
            return "high"
        if "moderate" in text or "medium" in text:
            return "moderate"
        return "low"


class AgentOpinion(BaseModel):
    agent_name: str
    agent_role: str
    opinion: str
    confidence: Literal["low", "medium", "high"]

class TreatmentStep(BaseModel):
    day: int
    action: str
    details: str
    completed: bool = False

class TreatmentPlan(BaseModel):
    estimated_recovery_time: str
    required_materials: List[str]
    daily_regimen: List[TreatmentStep]

class AnalyzeResponse(BaseModel):
    analysis_id: str
    filename: str
    vision_diagnosis: VisionDiagnosis
    lifecycle_prediction: LifecyclePrediction
    agent_debates: Optional[List[AgentOpinion]] = None
    treatment_plan: Optional[TreatmentPlan] = None
    disclaimer: str

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@(gmail\.com|outlook\.com|yahoo\.com)$")
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatSession(BaseModel):
    id: str
    user_id: str
    title: str
    messages: list[ChatMessage]
    updated_at: str

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
