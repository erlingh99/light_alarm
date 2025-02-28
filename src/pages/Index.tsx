
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlarmForm } from "@/components/AlarmForm";
import { AlarmList } from "@/components/AlarmList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Moon, Sun } from "lucide-react";
import { alarmService } from "@/services/alarmService";
import { Alarm, IntensityCurve } from "@/types/alarm";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const Index = () => {
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
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
      recurrence: Alarm["recurrence"]; 
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
      toast({
        title: "Success",
        description: "Alarm created successfully",
        className: "bg-sage text-white border-none",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create alarm",
        variant: "destructive",
      });
    },
  });

  const updateAlarmMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Alarm> }) =>
      alarmService.updateAlarm(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      setIsDialogOpen(false);
      setEditingAlarm(null);
      toast({
        title: "Success",
        description: "Alarm updated successfully",
        className: "bg-sage text-white border-none",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update alarm",
        variant: "destructive",
      });
    },
  });

  const deleteAlarmMutation = useMutation({
    mutationFn: alarmService.deleteAlarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast({
        title: "Success",
        description: "Alarm deleted successfully",
        className: "bg-sage text-white border-none",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete alarm",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: {
    name: string;
    time: string;
    color: string;
    length: number;
    intensityCurve: IntensityCurve;
    recurrence: Alarm["recurrence"];
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

  const handleToggle = (id: string, isActive: boolean) => {
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
            <DialogContent>
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
