
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlarmForm } from "@/components/AlarmForm";
import { AlarmList } from "@/components/AlarmList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { alarmService } from "@/services/alarmService";
import { Alarm } from "@/types/alarm";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alarms = [] } = useQuery({
    queryKey: ["alarms"],
    queryFn: alarmService.getAlarms,
  });

  const createAlarmMutation = useMutation({
    mutationFn: (data: { name: string; time: string; recurrence: Alarm["recurrence"] }) =>
      alarmService.createAlarm(data.name, data.time, data.recurrence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Alarm created successfully",
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
      });
    },
  });

  const handleSubmit = (data: {
    name: string;
    time: string;
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
