"""
Generation router — /generate/*
Routes:
  POST /generate                         — story → screenplay + shots + sound
  GET  /generate/{project_id}/latest     — fetch most recent generation for a project
"""
import logging
from fastapi import APIRouter, HTTPException, Request, status, BackgroundTasks

from models.generation import StoryInput, GenerationResult
from services.llm_service import generate_production, edit_script
from services.db_service import save_generation, get_latest_generation, get_project, get_project_generations, update_generation_screenplay
from pydantic import BaseModel
from typing import Optional, List

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/generate", tags=["Generation"])


def _user_id(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return user.id


@router.post("", response_model=GenerationResult, status_code=status.HTTP_201_CREATED)
async def generate_route(request: Request, body: StoryInput):
    """
    Accept a story premise and project ID, run LLM generation
    (HuggingFace → Gemini fallback), persist the result, and return it.
    """
    uid = _user_id(request)

    # Verify project ownership
    project = get_project(body.project_id, uid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied.")

    # Generate
    try:
        result_dict, provider = await generate_production(body.story)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("Generation error: %s", exc)
        raise HTTPException(status_code=500, detail="Generation failed. Please try again.")

    # Persist to MongoDB
    try:
        saved = save_generation(
            project_id=body.project_id,
            payload={
                "story_input":  body.story,
                "screenplay":   result_dict.get("screenplay", ""),
                "shot_design":  result_dict.get("shot_design", []),
                "sound_design": result_dict.get("sound_design", []),
                "provider":     provider,
            },
        )
    except Exception as exc:
        logger.warning("Could not persist generation: %s", exc)
        saved = {}

    # Build and return response
    return GenerationResult(
        id=saved.get("id"),
        project_id=body.project_id,
        story_input=body.story,
        screenplay=result_dict.get("screenplay", ""),
        shot_design=result_dict.get("shot_design", []),
        sound_design=result_dict.get("sound_design", []),
        provider=provider,
        created_at=saved.get("created_at"),
    )


@router.get("/{project_id}/latest", response_model=GenerationResult)
async def get_latest_route(project_id: str, request: Request):
    """Return the most recent generation for a given project."""
    uid = _user_id(request)

    # Verify ownership
    project = get_project(project_id, uid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied.")

    generation = get_latest_generation(project_id)
    if not generation:
        raise HTTPException(status_code=404, detail="No generations found for this project.")

    return GenerationResult(
        id=generation["id"],
        project_id=project_id,
        story_input=generation["story_input"],
        screenplay=generation.get("screenplay", ""),
        shot_design=generation.get("shot_design", []),
        sound_design=generation.get("sound_design", []),
        provider=generation.get("provider", "unknown"),
        created_at=generation["created_at"],
    )


@router.get("/{project_id}/history", response_model=List[GenerationResult])
async def get_history_route(project_id: str, request: Request):
    """Return all generations for a project, newest first."""
    uid = _user_id(request)

    project = get_project(project_id, uid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied.")

    generations = get_project_generations(project_id)
    return [
        GenerationResult(
            id=g["id"],
            project_id=project_id,
            story_input=g.get("story_input", ""),
            screenplay=g.get("screenplay", ""),
            shot_design=g.get("shot_design", []),
            sound_design=g.get("sound_design", []),
            provider=g.get("provider", "unknown"),
            created_at=g.get("created_at"),
        )
        for g in generations
    ]


# ─── Script Editing ───────────────────────────────────────────────────────────

class ScriptEditRequest(BaseModel):
    script: str
    action: str  # expand | compress | rewrite | tone
    tone: Optional[str] = None


class ScriptEditResponse(BaseModel):
    script: str
    action: str


@router.post("/edit-script", response_model=ScriptEditResponse)
async def edit_script_route(request: Request, body: ScriptEditRequest):
    """Edit a screenplay: expand, compress, rewrite, or change tone."""
    _user_id(request)  # auth check

    if body.action not in ("expand", "compress", "rewrite", "tone"):
        raise HTTPException(status_code=400, detail="Invalid action. Use: expand, compress, rewrite, tone")

    if body.action == "tone" and not body.tone:
        raise HTTPException(status_code=400, detail="Tone is required for tone action.")

    try:
        result = await edit_script(body.script, body.action, body.tone or "")
    except Exception as exc:
        logger.error("Script edit error: %s", exc)
        raise HTTPException(status_code=500, detail="Script editing failed.")

    return ScriptEditResponse(script=result, action=body.action)


# ── Storyboard ────────────────────────────────────────────────
class StoryboardInput(BaseModel):
    shot_design: list


@router.post("/storyboard")
async def storyboard(body: StoryboardInput, request: Request):
    """Generate storyboard image prompts from shot design data."""
    _user_id(request)
    from services.llm_service import generate_storyboard_prompts
    panels = await generate_storyboard_prompts(body.shot_design)
    return panels


# ── Save screenplay ──────────────────────────────────────────
class ScreenplayUpdate(BaseModel):
    screenplay: str


@router.put("/{generation_id}/screenplay")
async def save_screenplay(generation_id: str, body: ScreenplayUpdate, request: Request):
    """Overwrite the screenplay text of an existing generation."""
    _user_id(request)
    updated = update_generation_screenplay(generation_id, body.screenplay)
    if not updated:
        raise HTTPException(status_code=404, detail="Generation not found.")
    return {"status": "ok", "id": updated.get("id")}
