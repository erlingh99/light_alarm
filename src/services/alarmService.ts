
import { Alarm, RecurrencePattern, IntensityCurve } from "@/types/alarm";
import { INITIAL_ALARM_LENGTH, INITIAL_START_INTENSITY, INITIAL_END_INTENSITY, INITIAL_INTENSITY_TYPE} from "@/consts"

// Mock database
const alarms: Alarm[] = [];
const deletedAlarms: Alarm[] = [];

let counter = 0;

export const alarmService = {
  getAlarms: async (): Promise<Alarm[]> => {
    return alarms;
  },

  createAlarm: async (
    name: string,
    time: string,
    recurrence: RecurrencePattern,
    color: string,
    length: number = INITIAL_ALARM_LENGTH,
    intensityCurve: IntensityCurve = {
      startIntensity: INITIAL_START_INTENSITY,
      endIntensity: INITIAL_END_INTENSITY,
      curve: INITIAL_INTENSITY_TYPE
    }
  ): Promise<Alarm> => {
    const newAlarm: Alarm = {
      id: counter++,
      name,
      time,
      color,
      length,
      intensityCurve,
      isActive: true,
      recurrence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    alarms.push(newAlarm);
    return newAlarm;
  },

  updateAlarm: async (id: number, updates: Partial<Alarm>): Promise<Alarm> => {
    const index = alarms.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Alarm not found");
    
    alarms[index] = {
      ...alarms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return alarms[index];
  },

  deleteAlarm: async (id: number): Promise<void> => {
    const idx = alarms.findIndex(a => a.id === id);
    if (idx > -1) {
      // Store the deleted alarm for potential restoration
      deletedAlarms.push(alarms[idx]);
      
      // Remove from active alarms
      alarms.splice(idx, 1);
    }
  },

  restoreAlarm: async (id: number): Promise<Alarm | null> => {
    const idx = deletedAlarms.findIndex(a => a.id === id)
    if (idx > -1) {
      // Add back to active alarms
      const restore = deletedAlarms[idx];
      alarms.push(restore);
      deletedAlarms.splice(idx, 1)
      return restore;
    }
    return null;
  }
};
