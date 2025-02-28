
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [hexInput, setHexInput] = useState(value);

  // Update hexInput when value prop changes
  useEffect(() => {
    setHexInput(value);
  }, [value]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    onChange(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    
    // Validate hex code format (#RRGGBB or #RGB)
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newHex)) {
      onChange(newHex);
    }
  };

  // Ensure value is a valid hex color
  const safeColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ? value : "#000000";

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="color">Alarm Color</Label>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-shrink-0">
          <Input 
            type="color" 
            id="color" 
            value={safeColor} 
            onChange={handleColorChange}
            className="h-10 w-10 p-1 cursor-pointer bg-transparent border-input overflow-hidden"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="#RRGGBB"
              value={hexInput}
              onChange={handleHexInputChange}
              className="font-mono"
              maxLength={7}
            />
            <div 
              className="h-8 w-8 rounded-full border border-input" 
              style={{ backgroundColor: safeColor }}
            />
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Choose a color from the color wheel or enter a valid hex code (e.g., #FF5733)
      </p>
    </div>
  );
};
