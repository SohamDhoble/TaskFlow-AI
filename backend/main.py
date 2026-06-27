import json
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import User, Project, Task
from schemas import AISuggestRequest, AISuggestResponse, MLPredictRequest, MLPredictResponse
from auth import get_current_user
from routes import auth as auth_routes
from routes import projects as project_routes
from routes import tasks as task_routes
from ml.predictor import predict_completion_time

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

# ─── Lifespan — create tables on startup ────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


# ─── App ─────────────────────────────────────────────────────────

app = FastAPI(
    title="TaskFlow API",
    description="AI-Powered Task Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://task-flow-ai-gamma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─── Include Routers ────────────────────────────────────────────

app.include_router(auth_routes.router)
app.include_router(project_routes.router)
app.include_router(task_routes.router)


# ─── Health Check ────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "TaskFlow API is running 🚀"}


# ─── AI Priority Suggestion (Ollama) ─────────────────────────────

@app.post("/ai/suggest-priority", response_model=AISuggestResponse, tags=["AI"])
async def suggest_priority(
    request: AISuggestRequest,
    current_user: User = Depends(get_current_user),
):
    """Use a local Ollama model to suggest task priority based on title and description."""
    prompt = (
        "You are a task priority classifier. Given a task title and description, "
        "suggest the priority level (high, medium, or low) and provide a brief reason.\n\n"
        f"Task Title: {request.title}\n"
        f"Task Description: {request.description or 'No description provided'}\n\n"
        'Respond ONLY with valid JSON in this exact format (no markdown, no code fences):\n'
        '{"priority": "high|medium|low", "reason": "brief explanation"}'
    )

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                },
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Ollama returned status {response.status_code}: {response.text}",
            )

        data = response.json()
        text = data.get("response", "").strip()

        # Clean markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        result = json.loads(text)
        priority = result.get("priority", "medium").lower()
        if priority not in ("high", "medium", "low"):
            priority = "medium"

        return AISuggestResponse(
            priority=priority,
            reason=result.get("reason", "Based on AI analysis"),
        )

    except json.JSONDecodeError:
        return AISuggestResponse(
            priority="medium",
            reason="AI response could not be parsed.",
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not connect to Ollama. Ensure it is running on http://localhost:11434.",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}",
        )


# ─── ML Completion Time Prediction ──────────────────────────────

@app.post("/ml/predict-time", response_model=MLPredictResponse, tags=["ML"])
def predict_time(
    request: MLPredictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Predict estimated completion time using ML model trained on historical tasks."""
    # Fetch all completed tasks from user's projects
    completed_tasks = (
        db.query(Task)
        .join(Project)
        .filter(
            Project.owner_id == current_user.id,
            Task.completed_at.isnot(None),
        )
        .all()
    )

    # Convert to dict format for predictor
    tasks_data = [
        {
            "priority": t.priority,
            "description": t.description or "",
            "created_at": t.created_at,
            "completed_at": t.completed_at,
        }
        for t in completed_tasks
    ]

    predicted = predict_completion_time(
        tasks_data=tasks_data,
        new_task_priority=request.priority or "medium",
        new_task_desc_length=len(request.description or ""),
    )

    return MLPredictResponse(predicted_time=predicted)


# ─── Run ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
