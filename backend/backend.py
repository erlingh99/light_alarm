from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime
from datetime import time as time_t, date as date_t
from uuid import uuid4, UUID
import json
import os
from pathlib import Path

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model for RecurrencePattern
class RecurrencePattern(BaseModel):
    type: Literal['daily', 'weekly', 'custom'] # daily | weekly | custom
    days: List[int] | None = None  # 0-6 for weekly (Monday-Sunday)
    customDates: List[date_t] | None = None  # Custom dates in ISO format

# Model for IntensityCurve
class IntensityCurve(BaseModel):
    startIntensity: int # 0-100
    endIntensity: int # 0-100
    curve: Literal['linear', 'asymptotic', 's-curve', 'custom']
    hyperParameter: int | None = None  # Curve-specific parameter
    controlPoints: List[dict] | None = None  # Custom curve control points

# Model for Alarm
class Alarm(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    createdAt: datetime = Field(default_factory=datetime.now) # ISO formatted string
    updatedAt: datetime = Field(default_factory=datetime.now) # ISO formatted string
    name: str
    time: time_t # HH:MM
    color: str # Hex color code
    length: int # Length in minutes
    intensityCurve: IntensityCurve
    isActive: bool
    recurrence: RecurrencePattern

class AlarmUpdate(BaseModel):
    name: str | None = None
    time: time_t | None = None # HH:MM
    color: str | None = None # Hex color code
    length: int | None = None # Length in minutes
    intensityCurve: IntensityCurve | None = None
    isActive: bool | None = None
    recurrence: RecurrencePattern | None = None

# File storage setup
STORAGE_FILE = "alarms.json"

def load_alarms() -> dict[UUID, Alarm]:
    """Load alarms from JSON file."""
    if not os.path.exists(STORAGE_FILE):
        return {}
    
    with open(STORAGE_FILE, 'r') as f:
        data = json.load(f)
        return {UUID(k): Alarm(**v) for k, v in data.items()}

def save_alarms(alarms: dict[UUID, Alarm]) -> None:
    """Save alarms to JSON file."""
    with open(STORAGE_FILE, 'w') as f:
        json.dump(
            {str(k): v.model_dump(exclude_none=True) for k, v in alarms.items()},
            f,
            indent=2,
            default=str
        )

# Initialize alarms from file
alarms_db: dict[UUID, Alarm] = load_alarms()

# Mount static files first, but only for the assets
app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

# API Routes
@app.get("/api/alarms", response_model=List[Alarm])
def get_alarms() -> List[Alarm]:
    return list(alarms_db.values())

@app.get("/api/alarms/{alarm_id}", response_model=Alarm)
def get_alarm(alarm_id: UUID):
    if alarm_id in alarms_db:
        return alarms_db[alarm_id]
    raise HTTPException(status_code=404, detail="Alarm not found")

@app.delete("/api/alarms/{alarm_id}")
def delete_alarm(alarm_id: UUID):
    if alarm_id in alarms_db:
        del alarms_db[alarm_id]
        save_alarms(alarms_db)
        return {"message": "Alarm deleted successfully"}
    raise HTTPException(status_code=404, detail="Alarm not found")

@app.post("/api/alarms", response_model=Alarm)
def set_alarm(alarm: Alarm):
    # save the alarm
    alarms_db[alarm.id] = alarm
    save_alarms(alarms_db)
    return alarm

@app.put("/api/alarms/{alarm_id}", response_model=Alarm)
def update_alarm(alarm_id: UUID, partial_alarm: AlarmUpdate):
    # Check if alarm exists (for update case)
    if alarm_id in alarms_db:
        alarm = alarms_db[alarm_id]
        update_data = alarm.model_dump() | partial_alarm.model_dump(exclude_unset=True, exclude_none=True)
        updated_alarm = Alarm(**update_data)
        updated_alarm.updatedAt = datetime.now()  # Update timestamp
        alarms_db[updated_alarm.id] = updated_alarm
        save_alarms(alarms_db)
        return updated_alarm
    raise HTTPException(status_code=404, detail="Alarm not found")

# Custom handler for non-API routes
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if not full_path.startswith("api/"):
        return FileResponse("../frontend/dist/index.html")
    raise HTTPException(status_code=404, detail="Not found")