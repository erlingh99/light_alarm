from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime, time as time_t, date as date_t
from uuid import UUID, uuid4

class RecurrencePattern(BaseModel):
    type: Literal['daily', 'weekly', 'custom'] # daily | weekly | custom
    days: List[int] | None = None  # 0-6 for weekly (Monday-Sunday)
    customDates: List[date_t] | None = None  # Custom dates in ISO format

class IntensityCurve(BaseModel):
    startIntensity: int # 0-100
    endIntensity: int # 0-100
    curve: Literal['linear', 'asymptotic', 's-curve', 'custom']
    hyperParameter: int | None = None  # Curve-specific parameter
    controlPoints: List[dict[float, float]] | None = None  # Custom curve control points

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