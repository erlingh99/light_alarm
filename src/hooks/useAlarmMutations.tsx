
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alarmService } from "@/services/alarmService";
import { Alarm } from "@/types/alarm";
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
      intensityCurve: Alarm['intensityCurve'];
      recurrence: Alarm['recurrence']; 
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
        style: { background: 'var(--sage)', color: 'white', border: 'none' },
      });
    },
    onError: (error) => {
      toast.error("Failed to create alarm", {
        duration: TOAST_DURATION,
        style: { background: 'var(--destructive)', color: 'white', border: 'none' },
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
        style: { background: 'var(--sage)', color: 'white', border: 'none' },
      });
    },
    onError: (error) => {
      toast.error("Failed to update alarm", {
        duration: TOAST_DURATION,
        style: { background: 'var(--destructive)', color: 'white', border: 'none' },
      });
    },
  });

  const deleteAlarmMutation = useMutation({
    mutationFn: alarmService.deleteAlarm,
    onSuccess: (_, deletedAlarmId) => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      
      toast.success("Alarm deleted successfully", {
        duration: RESTORE_TOAST_DURATION,
        style: { background: 'var(--sage)', color: 'white', border: 'none' },
        action: {
          label: "Undo",
          onClick: () => restoreAlarmMutation.mutate(deletedAlarmId),
        },
      });
    },
    onError: (error) => {
      toast.error("Failed to delete alarm", {
        duration: TOAST_DURATION,
        style: { background: 'var(--destructive)', color: 'white', border: 'none' },
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
          style: { background: 'var(--sage)', color: 'white', border: 'none' },
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to restore alarm", {
        duration: TOAST_DURATION,
        style: { background: 'var(--destructive)', color: 'white', border: 'none' },
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
