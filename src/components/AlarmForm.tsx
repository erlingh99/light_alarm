
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "./TimePicker";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { RecurrencePattern, IntensityCurve } from "@/types/alarm";
import { toast } from "sonner";
import { ColorPicker } from "./ColorPicker";
import { AlarmLengthSelector } from "./AlarmLengthSelector";
import { IntensityCurveSelector } from "./IntensityCurveSelector";
import * as consts from "@/consts"

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
  const [name, setName] = useState(initialData?.name || consts.INITIAL_ALARM_NAME);
  const [time, setTime] = useState(initialData?.time || consts.INITIAL_ALARM_TIME);
  const [color, setColor] = useState(initialData?.color || consts.INITIAL_ALARM_COLOR);
  const [length, setLength] = useState(initialData?.length || consts.INITIAL_ALARM_LENGTH);
  const [intensityCurve, setIntensityCurve] = useState<IntensityCurve>(
    initialData?.intensityCurve || {
      startIntensity: consts.INITIAL_START_INTENSITY,
      endIntensity: consts.INITIAL_END_INTENSITY,
      curve: consts.INITIAL_INTENSITY_TYPE,
    }
  );
  const [recurrence, setRecurrence] = useState<RecurrencePattern>(
    initialData?.recurrence || { type: "daily" }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter an alarm name", {
        duration: consts.TOAST_DURATION,
      });
      return;
    }

    if (recurrence.type === "weekly" && (!recurrence.days || recurrence.days.length === 0)) {
      toast.error("Please select at least one day for weekly alarm", {
        duration: consts.TOAST_DURATION,
      });
      return;
    }

    if (recurrence.type === "custom" && (!recurrence.customDates || recurrence.customDates.length === 0)) {
      toast.error("Please select at least one date for custom alarm", {
        duration: consts.TOAST_DURATION,
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
          placeholder={consts.ALARM_TOOLTIP}
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
