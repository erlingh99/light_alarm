from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from datetime import datetime

from ..models.alarm import Alarm, AlarmUpdate
from ..storage import load_alarms, save_alarms

router = APIRouter(prefix="/api/alarms", tags=["alarms"])

# Initialize alarms from file
alarms_db = load_alarms()

@router.get("", response_model=List[Alarm])
def get_alarms() -> List[Alarm]:
    return list(alarms_db.values())

@router.get("/{alarm_id}", response_model=Alarm)
def get_alarm(alarm_id: UUID):
    if alarm_id in alarms_db:
        return alarms_db[alarm_id]
    raise HTTPException(status_code=404, detail="Alarm not found")

@router.delete("/{alarm_id}")
def delete_alarm(alarm_id: UUID):
    if alarm_id in alarms_db:
        del alarms_db[alarm_id]
        save_alarms(alarms_db)
        return {"message": "Alarm deleted successfully"}
    raise HTTPException(status_code=404, detail="Alarm not found")

@router.post("", response_model=Alarm)
def set_alarm(alarm: Alarm):
    # save the alarm
    alarms_db[alarm.id] = alarm
    save_alarms(alarms_db)
    return alarm

@router.put("/{alarm_id}", response_model=Alarm)
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