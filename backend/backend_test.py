from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime
from datetime import time as time_t, date as date_t
from uuid import uuid4, UUID
from enum import StrEnum

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

# Fake database to store alarms
fake_db: dict[int, Alarm] = {}

@app.get("/alarms", response_model=List[Alarm])
def get_alarms() -> List[Alarm]:
    return list(fake_db.values())

@app.get("/alarms/{alarm_id}", response_model=Alarm)
def get_alarms(alarm_id: UUID):
    if alarm_id in fake_db:
        return fake_db[alarm_id]
    raise HTTPException(status_code=404, detail="Alarm not found")

@app.delete("/alarms/{alarm_id}")
def delete_alarm(alarm_id: UUID):
    if alarm_id in fake_db:
        del fake_db[alarm_id]
        return {"message": "Alarm deleted successfully"}
    raise HTTPException(status_code=404, detail="Alarm not found")

@app.post("/alarms", response_model=Alarm)
def set_alarm(alarm: Alarm):
    # save the alarm
    fake_db[alarm.id] = alarm
    return alarm

@app.put("/alarms/{alarm_id}", response_model=AlarmUpdate)
def update_alarm(alarm_id: UUID, partial_alarm: AlarmUpdate):
    # Check if alarm exists (for update case)
    if alarm_id in fake_db:
        alarm = fake_db[alarm_id]
        update_data = alarm.model_dump() | partial_alarm.model_dump(exclude_unset=True, exclude_none=True)
        updated_alarm = Alarm(**update_data)
        updated_alarm.updatedAt = datetime.now()  # Update timestamp
        fake_db[updated_alarm.id] = updated_alarm
        return updated_alarm
    return HTTPException(status_code=404, detail="Alarm not found")