
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alarmService } from "@/services/alarmService";
import { Alarm, IntensityCurve, RecurrencePattern } from "@/types/alarm";
import { toast } from "sonner";
import { TOAST_DURATION, RESTORE_TOAST_DURATION } from "@/consts";

export function useAlarmMutations() {
  const queryClient = useQueryClient();

  const createAlarmMutation = useMutation({
    mutationFn: (data: { 
      name: string; 
      time: string; 
      color: string; 
      length: number;
      intensityCurve: IntensityCurve;
      recurrence: RecurrencePattern; 
    }) =>
      alarmService.createAlarm(
        data.name, 
        data.time, 
        data.recurrence, 
        data.color,
        data.length,
        data.intensityCurve
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success("Alarm created successfully", {
        duration: TOAST_DURATION,
      });
    },
    onError: (error: Error) => {
      console.error("Error creating alarm:", error);
      toast.error(`Failed to create alarm: ${error.message}`, {
        duration: TOAST_DURATION,
      });
    },
  });

  const updateAlarmMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<Alarm> }) =>
      alarmService.updateAlarm(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success("Alarm updated successfully", {
        duration: TOAST_DURATION,
      });
    },
    onError: (error: Error) => {
      console.error("Error updating alarm:", error);
      toast.error(`Failed to update alarm: ${error.message}`, {
        duration: TOAST_DURATION,
      });
    },
  });

  const deleteAlarmMutation = useMutation({
    mutationFn: alarmService.deleteAlarm,
    onSuccess: (_, deletedAlarmId) => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      
      toast.success("Alarm deleted successfully", {
        duration: RESTORE_TOAST_DURATION,
        action: {
          label: "Undo",
          onClick: () => restoreAlarmMutation.mutate(deletedAlarmId),
        },
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting alarm:", error);
      toast.error(`Failed to delete alarm: ${error.message}`, {
        duration: TOAST_DURATION,
      });
    },
  });

  const restoreAlarmMutation = useMutation({
    mutationFn: alarmService.restoreAlarm,
    onSuccess: (restoredAlarm) => {
      if (restoredAlarm) {
        queryClient.invalidateQueries({ queryKey: ["alarms"] });
        toast.success("Alarm restored successfully", {
          duration: TOAST_DURATION,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error restoring alarm:", error);
      toast.error(`Failed to restore alarm: ${error.message}`, {
        duration: TOAST_DURATION,
      });
    },
  });

  return {
    createAlarmMutation,
    updateAlarmMutation,
    deleteAlarmMutation,
    restoreAlarmMutation
  };
}
