
import { useState } from "react";
import { AlarmList } from "@/components/AlarmList";
import { AlarmHeader } from "@/components/AlarmHeader";
import { Alarm } from "@/types/alarm";
import { useAlarmMutations } from "@/hooks/useAlarmMutations";
import { useAlarms } from "@/hooks/useAlarms";

const Index = () => {
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { alarms } = useAlarms();
  const { 
    createAlarmMutation, 
    updateAlarmMutation, 
    deleteAlarmMutation 
  } = useAlarmMutations();

  const handleSubmit = (data: {
    name: string;
    time: string;
    color: string;
    length: number;
    intensityCurve: Alarm['intensityCurve'];
    recurrence: Alarm['recurrence'];
  }) => {
    if (editingAlarm) {
      updateAlarmMutation.mutate({
        id: editingAlarm.id,
        updates: data,
      });
    } else {
      createAlarmMutation.mutate(data);
    }
    setIsDialogOpen(false);
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
      <AlarmHeader 
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingAlarm={editingAlarm}
        setEditingAlarm={setEditingAlarm}
        onSubmit={handleSubmit}
      />

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
