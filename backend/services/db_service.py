"""
MongoDB service — handles connection and CRUD for projects and generations.
"""
from functools import lru_cache
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import MongoClient, DESCENDING
from config import get_settings


@lru_cache()
def get_db():
    """Singleton MongoDB database connection."""
    s = get_settings()
    client = MongoClient(s.mongodb_uri)
    return client[s.mongodb_db_name]


def _serialize(doc: dict) -> dict:
    """Convert MongoDB doc to JSON-serializable dict (ObjectId → str)."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
        doc["user_id"] = str(doc["user_id"])
    if "project_id" in doc and isinstance(doc["project_id"], ObjectId):
        doc["project_id"] = str(doc["project_id"])
    return doc


# ── Users ─────────────────────────────────────────────────────

def find_user_by_email(email: str) -> Optional[dict]:
    db = get_db()
    user = db.users.find_one({"email": email.lower()})
    return _serialize(user)


def find_user_by_id(user_id: str) -> Optional[dict]:
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    return _serialize(user)


def create_user(email: str, hashed_password: str, name: str) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "email": email.lower(),
        "password": hashed_password,
        "name": name,
        "created_at": now,
        "updated_at": now,
    }
    result = db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


# ── Projects ──────────────────────────────────────────────────

def list_projects(user_id: str) -> List[dict]:
    db = get_db()
    cursor = db.projects.find({"user_id": user_id}).sort("created_at", DESCENDING)
    return [_serialize(doc) for doc in cursor]


def get_project(project_id: str, user_id: str) -> Optional[dict]:
    db = get_db()
    try:
        doc = db.projects.find_one({"_id": ObjectId(project_id), "user_id": user_id})
    except Exception:
        return None
    return _serialize(doc)


def create_project(user_id: str, data: dict) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        **data,
        "user_id": user_id,
        "created_at": now,
        "updated_at": now,
    }
    result = db.projects.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def update_project(project_id: str, user_id: str, data: dict) -> Optional[dict]:
    db = get_db()
    data["updated_at"] = datetime.now(timezone.utc)
    try:
        result = db.projects.find_one_and_update(
            {"_id": ObjectId(project_id), "user_id": user_id},
            {"$set": data},
            return_document=True,
        )
    except Exception:
        return None
    return _serialize(result)


def delete_project(project_id: str, user_id: str) -> bool:
    db = get_db()
    try:
        result = db.projects.delete_one({"_id": ObjectId(project_id), "user_id": user_id})
        if result.deleted_count > 0:
            # Cascade: delete all generations for this project
            db.generations.delete_many({"project_id": project_id})
            return True
    except Exception:
        pass
    return False


# ── Generations ───────────────────────────────────────────────

def save_generation(project_id: str, payload: dict) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        **payload,
        "project_id": project_id,
        "created_at": now,
    }
    result = db.generations.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_latest_generation(project_id: str) -> Optional[dict]:
    db = get_db()
    doc = db.generations.find_one(
        {"project_id": project_id},
        sort=[("created_at", DESCENDING)],
    )
    return _serialize(doc)


def get_project_generations(project_id: str) -> List[dict]:
    """Return all generations for a project, newest first."""
    db = get_db()
    cursor = db.generations.find(
        {"project_id": project_id}
    ).sort("created_at", DESCENDING)
    return [_serialize(doc) for doc in cursor]


def update_generation_screenplay(generation_id: str, screenplay: str) -> Optional[dict]:
    """Overwrite the screenplay field of an existing generation."""
    db = get_db()
    result = db.generations.find_one_and_update(
        {"_id": ObjectId(generation_id)},
        {"$set": {"screenplay": screenplay, "updated_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    return _serialize(result)


# ── Call Sheet ────────────────────────────────────────────────

def create_callsheet_entry(project_id: str, data: dict) -> dict:
    """Add an actor / crew member entry to a project's call sheet."""
    db = get_db()
    doc = {
        "project_id": project_id,
        "name": data["name"],
        "role": data.get("role", ""),
        "phone": data.get("phone", ""),
        "email": data.get("email", ""),
        "notes": data.get("notes", ""),
        "available_dates": data.get("available_dates", []),   # list of ISO date strings
        "created_at": datetime.utcnow().isoformat(),
    }
    result = db.callsheet.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_callsheet(project_id: str) -> list:
    """Return all call sheet entries for a project."""
    db = get_db()
    cursor = db.callsheet.find({"project_id": project_id}).sort("created_at", 1)
    return [_serialize(doc) for doc in cursor]


def update_callsheet_entry(entry_id: str, data: dict) -> dict | None:
    """Update a call sheet entry by its id."""
    db = get_db()
    update_fields = {}
    for key in ("name", "role", "phone", "email", "notes", "available_dates"):
        if key in data:
            update_fields[key] = data[key]
    if not update_fields:
        return None
    db.callsheet.update_one({"_id": ObjectId(entry_id)}, {"$set": update_fields})
    doc = db.callsheet.find_one({"_id": ObjectId(entry_id)})
    return _serialize(doc) if doc else None


def delete_callsheet_entry(entry_id: str) -> bool:
    """Delete a call sheet entry."""
    db = get_db()
    result = db.callsheet.delete_one({"_id": ObjectId(entry_id)})
    return result.deleted_count > 0


# ── Indexes (called once on startup) ─────────────────────────

def ensure_indexes():
    db = get_db()
    db.users.create_index("email", unique=True)
    db.projects.create_index("user_id")
    db.generations.create_index([("project_id", 1), ("created_at", -1)])
    db.callsheet.create_index("project_id")
