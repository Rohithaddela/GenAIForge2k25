from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class StoryInput(BaseModel):
    project_id: str
    story: str = Field(..., min_length=20, description="Story premise or synopsis")


class Shot(BaseModel):
    number: int
    description: str
    camera_angle: str
    movement: str
    lighting: str
    lens: str
    emotional_tone: str
    duration: str
    notes: Optional[str] = None


class ShotGroup(BaseModel):
    id: str
    scene_title: str
    shots: List[Shot]


class MusicDetail(BaseModel):
    track: str
    description: str
    tempo: str
    key: str
    mood: str
    instrumentation: str


class DialogueDetail(BaseModel):
    treatment: str
    notes: str


class SoundScene(BaseModel):
    scene_id: str
    scene_title: str
    time_of_day: str
    music: MusicDetail
    ambient: List[str]
    foley: List[str]
    mixing_notes: str
    dialogue: DialogueDetail


class GenerationResult(BaseModel):
    id: Optional[str] = None
    project_id: str
    story_input: str
    screenplay: str
    shot_design: List[ShotGroup]
    sound_design: List[SoundScene]
    provider: str
    created_at: Optional[datetime] = None
