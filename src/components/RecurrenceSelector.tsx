
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { RecurrencePattern } from "@/types/alarm";

interface RecurrenceSelectorProps {
  value: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
}) => {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      <Label>Repeat</Label>
      <RadioGroup
        value={value.type}
        onValueChange={(type: "daily" | "weekly" | "custom") =>
          onChange({ ...value, type })
        }
        className="flex flex-col gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="daily" id="daily" />
          <Label htmlFor="daily">Daily</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="weekly" id="weekly" />
          <Label htmlFor="weekly">Weekly</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">Custom</Label>
        </div>
      </RadioGroup>

      {value.type === "weekly" && (
        <div className="mt-4">
          <Label className="mb-2 block">Select days</Label>
          <div className="flex gap-2 flex-wrap">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className="flex items-center space-x-2 bg-background/50 p-2 rounded-lg"
              >
                <Checkbox
                  id={day}
                  checked={(value.days || []).includes(index)}
                  onCheckedChange={(checked) => {
                    const days = value.days || [];
                    onChange({
                      ...value,
                      days: checked
                        ? [...days, index]
                        : days.filter((d) => d !== index),
                    });
                  }}
                />
                <Label htmlFor={day}>{day}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
