"""
File-based storage for alarms
"""

import json
import os
from typing import Dict
from uuid import UUID

from ..models.alarm import Alarm

# File storage setup
STORAGE_FILE = "alarms.json"

def load_alarms() -> Dict[UUID, Alarm]:
    """Load alarms from JSON file."""
    if not os.path.exists(STORAGE_FILE):
        return {}
    
    with open(STORAGE_FILE, 'r') as f:
        data = json.load(f)
        return {UUID(k): Alarm.model_validate(v) for k, v in data.items()}

def save_alarms(alarms: Dict[UUID, Alarm]) -> None:
    """Save alarms to JSON file."""
    with open(STORAGE_FILE, 'w') as f:
        json.dump(
            {str(k): v.model_dump() for k, v in alarms.items()},
            f,
            indent=2,
            default=str
        ) 