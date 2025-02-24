
import React from "react";
import { Alarm } from "@/types/alarm";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface AlarmListProps {
  alarms: Alarm[];
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

const formatRecurrence = (alarm: Alarm) => {
  const { type, days } = alarm.recurrence;
  if (type === "daily") return "Every day";
  if (type === "weekly" && days) {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `Every ${days.map((d) => weekDays[d]).join(", ")}`;
  }
  return "Custom";
};

export const AlarmList: React.FC<AlarmListProps> = ({
  alarms,
  onToggle,
  onEdit,
  onDelete,
}) => {
  if (alarms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fade-in">
        No alarms set yet
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {alarms.map((alarm) => (
        <div
          key={alarm.id}
          className="flex items-center justify-between p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex-1">
            <h3 className="font-medium">{alarm.name}</h3>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{alarm.time}</span>
              <span>{formatRecurrence(alarm)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Switch
              checked={alarm.isActive}
              onCheckedChange={(checked) => onToggle(alarm.id, checked)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(alarm)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(alarm.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
