
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    // Ensure the time is in 24-hour format
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
      onChange(newTime);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor="time">Time (24h)</Label>
      <Input
        type="time"
        id="time"
        value={value}
        onChange={handleTimeChange}
        className="w-full p-2 rounded-lg border border-input bg-transparent"
        required
      />
    </div>
  );
};
