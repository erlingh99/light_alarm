
import { Alarm, RecurrencePattern, IntensityCurve } from "@/types/alarm";
import { API_BASE_URL } from "@/config";
import { INITIAL_ALARM_LENGTH, INITIAL_START_INTENSITY, INITIAL_END_INTENSITY, INITIAL_INTENSITY_TYPE } from "@/consts";

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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete alarm: ${response.statusText}`);
    }
  },

  restoreAlarm: async (id: number): Promise<Alarm | null> => {
    // Since we've moved to a real API, restore would need to be implemented on the backend
    // For now, we'll create a workaround by sending a PUT request to reactivate a deleted alarm
    // Assuming the backend has a soft delete mechanism
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/restore`, {
        method: "PUT",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to restore alarm: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error restoring alarm:", error);
      return null;
    }
  }
};
