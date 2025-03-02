import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlarmForm } from "@/components/AlarmForm";
import { AlarmList } from "@/components/AlarmList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Moon, Sun } from "lucide-react";
import { alarmService } from "@/services/alarmService";
import { Alarm, IntensityCurve, RecurrencePattern } from "@/types/alarm";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { TOAST_DURATION, RESTORE_TOAST_DURATION} from "@/consts"

const Index = () => {
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: alarms = [] } = useQuery({
    queryKey: ["alarms"],
    queryFn: alarmService.getAlarms,
  });

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
      setIsDialogOpen(false);
      toast.success("Alarm created successfully", {
        duration: TOAST_DURATION,
        className: "bg-sage text-white border-none",
      });
    },
    onError: (error) => {
      toast.error("Failed to create alarm", {
        duration: TOAST_DURATION,
        className: "bg-destructive text-white border-none",
      });
    },
  });

  const updateAlarmMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<Alarm> }) =>
      alarmService.updateAlarm(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      setIsDialogOpen(false);
      setEditingAlarm(null);
      toast.success("Alarm updated successfully", {
        duration: TOAST_DURATION,
        className: "bg-sage text-white border-none",
      });
    },
    onError: (error) => {
      toast.error("Failed to update alarm", {
        duration: TOAST_DURATION,
        className: "bg-destructive text-white border-none",
      });
    },
  });

  const deleteAlarmMutation = useMutation({
    mutationFn: alarmService.deleteAlarm,
    onSuccess: (_, deletedAlarmId) => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      
      toast.success("Alarm deleted successfully", {
        duration: RESTORE_TOAST_DURATION,
        className: "bg-sage text-white border-none",
        action: {
          label: "Undo",
          onClick: () => restoreAlarmMutation.mutate(deletedAlarmId),
        },
      });
    },
    onError: (error) => {
      toast.error("Failed to delete alarm", {
        duration: TOAST_DURATION,
        className: "bg-destructive text-white border-none",
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
          className: "bg-sage text-white border-none",
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to restore alarm", {
        duration: TOAST_DURATION,
        className: "bg-destructive text-white border-none",
      });
    },
  });

  const handleSubmit = (data: {
    name: string;
    time: string;
    color: string;
    length: number;
    intensityCurve: IntensityCurve;
    recurrence: RecurrencePattern;
  }) => {
    if (editingAlarm) {
      updateAlarmMutation.mutate({
        id: editingAlarm.id,
        updates: data,
      });
    } else {
      createAlarmMutation.mutate(data);
    }
  };

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsDialogOpen(true);
  };

  const handleToggle = (id: number, isActive: boolean) => {
    updateAlarmMutation.mutate({
      id,
      updates: { isActive },
    });
  };

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Alarms</h1>
          <p className="text-muted-foreground mt-2">Schedule and manage your alarms</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingAlarm(null)}
                className="bg-sage hover:bg-sage-light transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Alarm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAlarm ? "Edit Alarm" : "Create New Alarm"}
                </DialogTitle>
              </DialogHeader>
              <AlarmForm
                onSubmit={handleSubmit}
                initialData={editingAlarm || undefined}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AlarmList
        alarms={alarms}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={(id) => deleteAlarmMutation.mutate(id)}
      />
    </div>
  );
};

export default Index;
