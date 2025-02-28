
import { Alarm, RecurrencePattern } from "@/types/alarm";

// Mock database
let alarms: Alarm[] = [];

const generateId = () => Math.random().toString(36).substr(2, 9);

export const alarmService = {
  getAlarms: async (): Promise<Alarm[]> => {
    return alarms;
  },

  createAlarm: async (
    name: string,
    time: string,
    recurrence: RecurrencePattern,
    color: string
  ): Promise<Alarm> => {
    const newAlarm: Alarm = {
      id: generateId(),
      name,
      time,
      color,
      isActive: true,
      recurrence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    alarms.push(newAlarm);
    return newAlarm;
  },

  updateAlarm: async (id: string, updates: Partial<Alarm>): Promise<Alarm> => {
    const index = alarms.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Alarm not found");
    
    alarms[index] = {
      ...alarms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return alarms[index];
  },

  deleteAlarm: async (id: string): Promise<void> => {
    alarms = alarms.filter((a) => a.id !== id);
  },
};
