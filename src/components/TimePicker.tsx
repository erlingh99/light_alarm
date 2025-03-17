
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
    onChange(e.target.value);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor="time">Time</Label>
      <Input
        type="time"
        id="time"
        step="300"
        value={value}
        onChange={handleTimeChange}
        className="w-full p-2 rounded-lg border border-input bg-transparent"
        required
      />
    </div>
  );
};
