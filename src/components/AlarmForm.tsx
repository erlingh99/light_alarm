
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "./TimePicker";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { RecurrencePattern, IntensityCurve } from "@/types/alarm";
import { toast } from "@/hooks/use-toast";
import { ColorPicker } from "./ColorPicker";
import { AlarmLengthSelector } from "./AlarmLengthSelector";
import { IntensityCurveSelector } from "./IntensityCurveSelector";

interface AlarmFormProps {
  onSubmit: (data: {
    name: string;
    time: string;
    color: string;
    length: number;
    intensityCurve: IntensityCurve;
    recurrence: RecurrencePattern;
  }) => void;
  initialData?: {
    name: string;
    time: string;
    color: string;
    length?: number;
    intensityCurve?: IntensityCurve;
    recurrence: RecurrencePattern;
  };
}

export const AlarmForm: React.FC<AlarmFormProps> = ({ onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [time, setTime] = useState(initialData?.time || "08:00");
  const [color, setColor] = useState(initialData?.color || "#4CAF50");
  const [length, setLength] = useState(initialData?.length || 15);
  const [intensityCurve, setIntensityCurve] = useState<IntensityCurve>(
    initialData?.intensityCurve || {
      startIntensity: 0,
      endIntensity: 100,
      curve: "linear",
    }
  );
  const [recurrence, setRecurrence] = useState<RecurrencePattern>(
    initialData?.recurrence || { type: "daily" }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an alarm name",
        variant: "destructive",
      });
      return;
    }

    if (recurrence.type === "weekly" && (!recurrence.days || recurrence.days.length === 0)) {
      toast({
        title: "Error",
        description: "Please select at least one day for weekly alarm",
        variant: "destructive",
      });
      return;
    }

    if (recurrence.type === "custom" && (!recurrence.customDates || recurrence.customDates.length === 0)) {
      toast({
        title: "Error",
        description: "Please select at least one date for custom alarm",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ name, time, color, length, intensityCurve, recurrence });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <Label htmlFor="name">Alarm Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rise and shine"
          className="mt-1"
        />
      </div>

      <TimePicker value={time} onChange={setTime} />

      <ColorPicker value={color} onChange={setColor} />

      <AlarmLengthSelector value={length} onChange={setLength} />

      <IntensityCurveSelector 
        value={intensityCurve} 
        onChange={setIntensityCurve} 
      />

      <RecurrenceSelector value={recurrence} onChange={setRecurrence} />

      <Button type="submit" className="w-full">
        Save Alarm
      </Button>
    </form>
  );
};
