
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { RecurrencePattern } from "@/types/alarm";
import { addDays } from "date-fns";

interface RecurrenceSelectorProps {
  value: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
}) => {
  // Reorder weekdays to start with Monday
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDayIndices = [1, 2, 3, 4, 5, 6, 0]; // Map display order to actual day indices

  // Convert dates array to Date objects for the calendar
  const selectedDates = value.customDates?.map(date => new Date(date)) || [];

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
    
    // Sort dates chronologically
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const newDates = sortedDates.map(date => date.toISOString());
    
    onChange({
      ...value,
      customDates: newDates,
    });
  };

  const handleDaySelect = (checked: boolean | "indeterminate", dayIndex: number) => {
    const days = value.days || [];
    let newDays = checked
      ? [...days, dayIndex]
      : days.filter((d) => d !== dayIndex);
    
    // Sort days in calendar order (Sunday = 0, Monday = 1, etc.)
    newDays = newDays.sort((a, b) => a - b);
    
    onChange({
      ...value,
      days: newDays,
    });
  };

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
                  checked={(value.days || []).includes(weekDayIndices[index])}
                  onCheckedChange={(checked) => 
                    handleDaySelect(checked, weekDayIndices[index])
                  }
                />
                <Label htmlFor={day}>{day}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {value.type === "custom" && (
        <div className="mt-4">
          <Label className="mb-2 block">Select dates</Label>
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateSelect}
            disabled={{ before: addDays(new Date(), -1) }}
            className="rounded-md border"
          />
        </div>
      )}
    </div>
  );
};
