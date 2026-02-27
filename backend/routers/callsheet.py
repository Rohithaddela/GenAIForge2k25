"""Call Sheet router – manage actors / crew availability per project."""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.db_service import (
    create_callsheet_entry,
    get_callsheet,
    update_callsheet_entry,
    delete_callsheet_entry,
)

router = APIRouter(prefix="/callsheet", tags=["callsheet"])


class CallSheetEntryIn(BaseModel):
    name: str
    role: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    notes: Optional[str] = ""
    available_dates: Optional[List[str]] = []


class CallSheetEntryUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    available_dates: Optional[List[str]] = None


# ── LIST ──────────────────────────────────────────────────────
@router.get("/{project_id}")
async def list_entries(project_id: str, request: Request):
    entries = get_callsheet(project_id)
    return entries


# ── CREATE ────────────────────────────────────────────────────
@router.post("/{project_id}")
async def add_entry(project_id: str, body: CallSheetEntryIn, request: Request):
    entry = create_callsheet_entry(project_id, body.model_dump())
    return entry


# ── UPDATE ────────────────────────────────────────────────────
@router.put("/entry/{entry_id}")
async def update_entry(entry_id: str, body: CallSheetEntryUpdate, request: Request):
    updated = update_callsheet_entry(entry_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Entry not found")
    return updated


# ── DELETE ────────────────────────────────────────────────────
@router.delete("/entry/{entry_id}")
async def remove_entry(entry_id: str, request: Request):
    ok = delete_callsheet_entry(entry_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"ok": True}
