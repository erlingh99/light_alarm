
import { Alarm, RecurrencePattern, IntensityCurve } from "@/types/alarm";
import { INITIAL_ALARM_LENGTH, INITIAL_START_INTENSITY, INITIAL_END_INTENSITY, INITIAL_INTENSITY_TYPE} from "@/consts"

// Mock database
let alarms: Alarm[] = [];
let deletedAlarm: Alarm | null;

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
    const alarmToDelete = alarms.find(a => a.id === id);
    if (alarmToDelete) {
      // Store the deleted alarm for potential restoration
      deletedAlarm = alarmToDelete;
      
      // Remove from active alarms
      alarms = alarms.filter((a) => a.id !== id);
    }
  },

  restoreAlarm: async (id: number): Promise<Alarm | null> => {
    
    if (deletedAlarm?.id === id) {
      // Add back to active alarms
      alarms.push(deletedAlarm);
      
      return deletedAlarm;
    }
    return null;
  }
};
