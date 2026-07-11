from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
import pypdf
import io
from datetime import datetime, timezone
from bson import ObjectId
from openai import AsyncOpenAI
from app.config import get_settings
from app.database import get_chats_collection
from app.routes.auth import get_current_user
from app.schemas import UserResponse, ChatRequest, ChatSession, ChatMessage

router = APIRouter(prefix="/api/qa", tags=["qa"])

@router.get("/sessions")
async def list_sessions(current_user: UserResponse = Depends(get_current_user)):
    collection = get_chats_collection()
    if collection is None:
        return []
    cursor = collection.find({"user_id": current_user.id}).sort("updated_at", -1)
    sessions = await cursor.to_list(length=50)
    
    result = []
    for s in sessions:
        s["id"] = str(s.pop("_id"))
        result.append(ChatSession(**s))
    return result

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: UserResponse = Depends(get_current_user)):
    collection = get_chats_collection()
    if collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    try:
        res = await collection.delete_one({"_id": ObjectId(session_id), "user_id": current_user.id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid session ID")

@router.post("/chat")
async def chat(request: ChatRequest, current_user: UserResponse = Depends(get_current_user)):
    settings = get_settings()
    collection = get_chats_collection()
    if collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")

    # Initialize API clients
    gemini_client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/") if settings.gemini_api_key else None
    groq_client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1") if settings.groq_api_key else None
    mistral_client = AsyncOpenAI(api_key=settings.mistral_api_key, base_url="https://api.mistral.ai/v1") if settings.mistral_api_key else None
    openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
    
    if not (gemini_client or groq_client or mistral_client or openai_client):
        raise HTTPException(status_code=500, detail="No AI providers are configured for Q&A.")
    # Retrieve existing session or create a new one
    session = None
    if request.session_id:
        try:
            session = await collection.find_one({"_id": ObjectId(request.session_id), "user_id": current_user.id})
        except:
            pass

    if not session:
        title = request.message[:30] + "..." if len(request.message) > 30 else request.message
        session = {
            "user_id": current_user.id,
            "title": title,
            "messages": [],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        res = await collection.insert_one(session)
        session["_id"] = res.inserted_id

    # Append user message
    session["messages"].append({"role": "user", "content": request.message})

    # Prepare OpenAI messages
    openai_messages = [{"role": "system", "content": "You are FloraAi, an advanced botanical and agricultural AI assistant. You MUST ONLY answer questions related to plants, botany, agriculture, greenhouse management, or crops. If the user asks about ANYTHING else (e.g., coding, general history, math, unrelated advice), you must refuse to answer and reply EXACTLY with: 'I am an AI specialized in botanical and agricultural analysis. I can only assist with plant-related inquiries.'"}]
    for msg in session["messages"]:
        openai_messages.append({"role": msg["role"], "content": msg["content"]})
    
    answer = None
    last_error = None
    
    # Attempt 1: Gemini 2.5 Flash
    if gemini_client and not answer:
        try:
            response = await gemini_client.chat.completions.create(
                model="gemini-2.5-flash",
                temperature=0.7,
                messages=openai_messages
            )
            answer = response.choices[0].message.content
        except Exception as e:
            last_error = f"Gemini 2.5 failed: {e}"

    # Attempt 1.5: Gemini 1.5 Pro
    if gemini_client and not answer:
        try:
            response = await gemini_client.chat.completions.create(
                model="gemini-1.5-pro",
                temperature=0.7,
                messages=openai_messages
            )
            answer = response.choices[0].message.content
        except Exception as e:
            last_error = f"Gemini 1.5 Pro failed: {e}"
            
    # Attempt 1.8: Gemini 1.5 Flash
    if gemini_client and not answer:
        try:
            response = await gemini_client.chat.completions.create(
                model="gemini-1.5-flash",
                temperature=0.7,
                messages=openai_messages
            )
            answer = response.choices[0].message.content
        except Exception as e:
            last_error = f"Gemini 1.5 Flash failed: {e}"

    # Attempt 2: Groq
    if groq_client and not answer:
        try:
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                messages=openai_messages
            )
            answer = response.choices[0].message.content
        except Exception as e:
            last_error = f"Groq failed: {e}"

    # Attempt 3: Mistral
    if mistral_client and not answer:
        try:
            response = await mistral_client.chat.completions.create(
                model="mistral-small-latest",
                temperature=0.7,
                messages=openai_messages
            )
            answer = response.choices[0].message.content
        except Exception as e:
            last_error = f"Mistral failed: {e}"

    # Attempt 4: OpenAI
    if openai_client and not answer:
        try:
            response = await openai_client.chat.completions.create(
                model=settings.openai_vision_model,
                temperature=0.7,
                messages=openai_messages
            )
            answer = response.choices[0].message.content
        except Exception as e:
            last_error = f"OpenAI failed: {e}"

    if not answer:
        raise HTTPException(status_code=500, detail=f"All AI providers failed. Last error: {last_error}")

    # Append AI message
    session["messages"].append({"role": "assistant", "content": answer})
    
    # Update DB
    updated_at = datetime.now(timezone.utc).isoformat()
    await collection.update_one(
        {"_id": session["_id"]},
        {"$set": {"messages": session["messages"], "updated_at": updated_at}}
    )

    return {
        "session_id": str(session["_id"]),
        "answer": answer,
        "title": session["title"]
    }
@router.post("/upload")
async def upload_file(
    session_id: str = Form(None),
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    settings = get_settings()
    collection = get_chats_collection()
    if collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")

    # Read file content
    content = await file.read()
    text = ""
    filename = file.filename.lower()
    
    if filename.endswith(".pdf"):
        try:
            pdf = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file.")
    elif filename.endswith(".csv") or filename.endswith(".txt"):
        try:
            text = content.decode("utf-8")
        except:
            raise HTTPException(status_code=400, detail="Invalid text file encoding. Please upload UTF-8 text.")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF, CSV, and TXT are allowed.")
        
    if not text.strip():
        raise HTTPException(status_code=400, detail="The uploaded file appears to be empty or unreadable.")

    groq_client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1") if settings.groq_api_key else None
    
    # Check if text is related to plants/agriculture
    check_prompt = "Does the following text contain data related to plants, agriculture, botany, greenhouse metrics, biology, or crop yields? Reply ONLY with YES or NO.\n\nText snippet:\n" + text[:2000]
    
    try:
        if groq_client:
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                messages=[{"role": "user", "content": check_prompt}]
            )
            is_plant_related = response.choices[0].message.content.strip().upper()
            
            if "YES" not in is_plant_related:
                raise HTTPException(status_code=400, detail=f"Error: I am an AI specialized in botanical and agricultural analysis. The file '{file.filename}' does not appear to contain plant-related data. Please upload a relevant botanical dataset.")
    except HTTPException:
        raise
    except Exception as e:
        pass # If verification fails, we'll just allow it to proceed to be safe

    # Proceed to append to session
    session = None
    if session_id:
        try:
            session = await collection.find_one({"_id": ObjectId(session_id), "user_id": current_user.id})
        except:
            pass

    user_msg = f"I have uploaded a file named '{file.filename}'. Here is its content:\n{text[:10000]}"
    
    if not session:
        title = f"Data Upload: {file.filename}"
        session = {
            "user_id": current_user.id,
            "title": title,
            "messages": [],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        res = await collection.insert_one(session)
        session["_id"] = res.inserted_id

    # Create a system message acknowledging the file context
    user_msg = f"I have uploaded a file named '{file.filename}'. Here is its content:\n{text[:3000]}"
    ai_reply = f"I have received the botanical data file '{file.filename}'. I've extracted its metrics and integrated them into our context. How can I help you analyze this data?"
    session["messages"].append({"role": "user", "content": user_msg})
    session["messages"].append({"role": "assistant", "content": ai_reply})

    updated_at = datetime.now(timezone.utc).isoformat()
    await collection.update_one(
        {"_id": session["_id"]},
        {"$set": {"messages": session["messages"], "updated_at": updated_at}}
    )

    return {
        "session_id": str(session["_id"]),
        "answer": ai_reply,
        "title": session["title"]
    }

@router.post("/voice")
async def voice_chat(
    audio: UploadFile = File(...),
    session_id: str = Form(None),
    current_user: UserResponse = Depends(get_current_user)
):
    settings = get_settings()
    
    try:
        # Read the audio into bytes
        audio_bytes = await audio.read()
        file_obj = (audio.filename or "audio.webm", audio_bytes, audio.content_type or "audio/webm")
        
        user_text = None
        transcription_error = None
        
        # 1. Try Groq Whisper
        if settings.groq_api_key:
            try:
                groq_client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1")
                transcription = await groq_client.audio.transcriptions.create(
                    file=file_obj,
                    model="whisper-large-v3",
                    response_format="json"
                )
                user_text = transcription.text
            except Exception as e:
                transcription_error = f"Groq Whisper failed: {e}"
        
        # 2. Try OpenAI Whisper Fallback
        if not user_text and settings.openai_api_key:
            try:
                openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
                transcription = await openai_client.audio.transcriptions.create(
                    file=file_obj,
                    model="whisper-1",
                    response_format="json"
                )
                user_text = transcription.text
            except Exception as e:
                transcription_error = f"OpenAI Whisper failed: {e}"
        
        if not user_text or not user_text.strip():
            raise HTTPException(status_code=400, detail=f"Could not understand audio. Last error: {transcription_error}")
            
        # Re-use the existing chat endpoint logic by calling it directly
        req = ChatRequest(session_id=session_id, message=user_text)
        chat_response = await chat(req, current_user)
        
        return {
            "session_id": chat_response["session_id"],
            "transcript": user_text,
            "answer": chat_response["answer"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")
