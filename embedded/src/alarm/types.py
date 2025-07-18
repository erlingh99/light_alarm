from micropython import const
import json
from time import localtime, mktime

class RecurrencePattern:
    DAILY = const(0)
    WEEKLY = const(1)
    CUSTOM = const(2)
    
    def __init__(self, data: dict):
        self.type = {
            'daily': self.DAILY,
            'weekly': self.WEEKLY,
            'custom': self.CUSTOM
        }.get(data['type'], self.DAILY)
        self.days = data.get('days', None)
        self.custom_dates = data.get('customDates', None)
    
    def should_trigger_today(self) -> bool:
        current_time = localtime()
        weekday = (current_time[6] + 1) % 7  # Convert to 0-6 (Mon-Sun)
        
        if self.type == self.DAILY:
            return True
        elif self.type == self.WEEKLY and self.days:
            return weekday in self.days
        elif self.type == self.CUSTOM and self.custom_dates:
            current_date = f"{current_time[0]}-{current_time[1]:02d}-{current_time[2]:02d}"
            return current_date in self.custom_dates
        return False

class IntensityCurve:
    LINEAR = const(0)
    ASYMPTOTIC = const(1)
    S_CURVE = const(2)
    CUSTOM = const(3)
    
    def __init__(self, data: dict):
        self.start_intensity = data['startIntensity']
        self.end_intensity = data['endIntensity']
        self.curve = {
            'linear': self.LINEAR,
            'asymptotic': self.ASYMPTOTIC,
            's-curve': self.S_CURVE,
            'custom': self.CUSTOM
        }.get(data['curve'], self.LINEAR)
        self.hyper_parameter = data.get('hyperParameter', None)
        self.control_points = data.get('controlPoints', None)

class Alarm:
    def __init__(self, data: dict):
        self.id = data['id']
        self.name = data['name']
        # Parse HH:MM time string to hours and minutes
        time_parts = data['time'].split(':')
        self.hours = int(time_parts[0])
        self.minutes = int(time_parts[1])
        self.color = data['color']
        self.length = data['length']
        self.intensity_curve = IntensityCurve(data['intensityCurve'])
        self.is_active = data['isActive']
        self.recurrence = RecurrencePattern(data['recurrence'])
    
    @property
    def next_trigger_time(self) -> int:
        """Returns the next trigger time as UNIX timestamp"""
        current = localtime()
        # Create a timestamp for today's alarm time
        alarm_time = mktime((
            current[0], current[1], current[2],  # Year, month, day
            self.hours, self.minutes, 0,         # Hours, minutes, seconds
            current[6], current[7]               # Weekday, yearday
        ))
        
        # If alarm time has passed today, add 24 hours
        current_timestamp = mktime(current)
        if alarm_time <= current_timestamp:
            alarm_time += 24 * 3600
        
        return alarm_time if self.recurrence.should_trigger_today() else None

    @classmethod
    def from_json(cls, json_str: str) -> 'Alarm':
        """Create an Alarm instance from JSON string"""
        data = json.loads(json_str)
        return cls(data)
