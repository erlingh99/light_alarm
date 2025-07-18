import time
from alarm.types import Alarm

class AlarmScheduler:
    def __init__(self):
        self.alarms = []
        self.next_alarm = None

    def update_alarms(self, alarms_data):
        self.alarms = [Alarm(a) for a in alarms_data if a.get('isActive', False)]
        self.schedule_next()

    def schedule_next(self):
        soonest = None
        soonest_time = None
        now = time.time()
        for alarm in self.alarms:
            trigger = alarm.next_trigger_time
            if trigger and (soonest_time is None or trigger < soonest_time):
                soonest = alarm
                soonest_time = trigger
        self.next_alarm = soonest
        return soonest

    def time_until_next(self):
        if not self.next_alarm:
            return None
        now = time.time()
        return max(0, self.next_alarm.next_trigger_time - now)

    def wait_for_next(self):
        t = self.time_until_next()
        if t is not None and t > 0:
            time.sleep(t)
        return self.next_alarm
