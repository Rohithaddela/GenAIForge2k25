"""
Projects router — /projects/*
Routes:
  GET    /projects          — list all projects for current user
  POST   /projects          — create new project
  GET    /projects/{id}     — get single project
  PATCH  /projects/{id}     — update project fields
  DELETE /projects/{id}     — delete project
"""
import logging
from fastapi import APIRouter, HTTPException, Request, status

from models.project import Project, ProjectCreate, ProjectUpdate, ProjectList
from services.db_service import (
    list_projects, get_project, create_project, update_project, delete_project
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects", tags=["Projects"])


def _user_id(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return user.id


@router.get("", response_model=ProjectList)
async def list_projects_route(request: Request):
    """List all projects belonging to the authenticated user."""
    uid = _user_id(request)
    try:
        projects = list_projects(uid)
        return ProjectList(projects=projects, total=len(projects))
    except Exception as exc:
        logger.error("List projects error: %s", exc)
        raise HTTPException(status_code=500, detail="Could not fetch projects.")


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project_route(request: Request, body: ProjectCreate):
    """Create a new project."""
    uid = _user_id(request)
    try:
        data = body.model_dump(exclude_none=True)
        # Convert date objects to ISO strings for MongoDB
        for k in ("start_date", "end_date"):
            if k in data and data[k] is not None:
                data[k] = data[k].isoformat()
        project = create_project(uid, data)
        return project
    except Exception as exc:
        logger.error("Create project error: %s", exc)
        raise HTTPException(status_code=500, detail="Could not create project.")


@router.get("/{project_id}", response_model=Project)
async def get_project_route(project_id: str, request: Request):
    """Fetch a single project by ID (must belong to current user)."""
    uid = _user_id(request)
    project = get_project(project_id, uid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@router.patch("/{project_id}", response_model=Project)
async def update_project_route(project_id: str, request: Request, body: ProjectUpdate):
    """Partially update a project's fields."""
    uid = _user_id(request)
    data = body.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=422, detail="No fields provided for update.")
    for k in ("start_date", "end_date"):
        if k in data and data[k] is not None:
            data[k] = data[k].isoformat()
    try:
        project = update_project(project_id, uid, data)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")
        return project
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Update project error: %s", exc)
        raise HTTPException(status_code=500, detail="Could not update project.")


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_route(project_id: str, request: Request):
    """Delete a project (cascades to generations)."""
    uid = _user_id(request)
    try:
        deleted = delete_project(project_id, uid)
        if not deleted:
            raise HTTPException(status_code=404, detail="Project not found.")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Delete project error: %s", exc)
        raise HTTPException(status_code=500, detail="Could not delete project.")
