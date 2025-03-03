
import { Alarm, RecurrencePattern, IntensityCurve } from "@/types/alarm";
import { API_BASE_URL } from "@/config";
import { INITIAL_ALARM_LENGTH, INITIAL_START_INTENSITY, INITIAL_END_INTENSITY, INITIAL_INTENSITY_TYPE } from "@/consts";

// Store for recently deleted alarms (client-side only)
const deletedAlarmsStore: Map<number, Alarm> = new Map();

export const alarmService = {
  getAlarms: async (): Promise<Alarm[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch alarms: ${response.statusText}`);
    }
    return response.json();
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
    const newAlarm = {
      name,
      time,
      color,
      length,
      intensityCurve,
      isActive: true,
      recurrence,
    };

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAlarm),
    });

    if (!response.ok) {
      throw new Error(`Failed to create alarm: ${response.statusText}`);
    }
    
    return response.json();
  },

  updateAlarm: async (id: number, updates: Partial<Alarm>): Promise<Alarm> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update alarm: ${response.statusText}`);
    }
    
    return response.json();
  },

  deleteAlarm: async (id: number): Promise<void> => {
    // First, get the alarm to store it before deletion
    try {
      const alarmResponse = await fetch(`${API_BASE_URL}/${id}`);
      if (alarmResponse.ok) {
        const alarm: Alarm = await alarmResponse.json();
        // Store the alarm in our client-side store
        deletedAlarmsStore.set(id, alarm);
      }
    } catch (error) {
      console.error("Error saving alarm before deletion:", error);
    }

    // Now delete the alarm
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete alarm: ${response.statusText}`);
    }
  },

  restoreAlarm: async (id: number): Promise<Alarm | null> => {
    // Get the deleted alarm from our client-side store
    const deletedAlarm = deletedAlarmsStore.get(id);
    
    if (!deletedAlarm) {
      console.error("Could not find deleted alarm to restore");
      return null;
    }
    
    try {
      // Create a new alarm with the same properties as the deleted one
      const { name, time, recurrence, color, length, intensityCurve } = deletedAlarm;
      
      const restoredAlarm = await this.createAlarm(
        name,
        time,
        recurrence,
        color,
        length,
        intensityCurve
      );
      
      // Remove from our deleted store after successful restoration
      deletedAlarmsStore.delete(id);
      
      return restoredAlarm;
    } catch (error) {
      console.error("Error restoring alarm:", error);
      return null;
    }
  }
};
