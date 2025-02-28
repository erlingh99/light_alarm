
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntensityCurve } from "@/types/alarm";

interface IntensityCurveSelectorProps {
  value: IntensityCurve;
  onChange: (curve: IntensityCurve) => void;
}

export const IntensityCurveSelector: React.FC<IntensityCurveSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleStartIntensityChange = (values: number[]) => {
    onChange({
      ...value,
      startIntensity: values[0],
    });
  };

  const handleEndIntensityChange = (values: number[]) => {
    onChange({
      ...value,
      endIntensity: values[0],
    });
  };

  const handleCurveTypeChange = (curveType: "linear" | "exponential" | "s-curve") => {
    onChange({
      ...value,
      curve: curveType,
    });
  };

  // Calculate points for the curve preview
  const getCurvePoints = () => {
    const { startIntensity, endIntensity, curve } = value;
    const points = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      let y;
      
      switch (curve) {
        case "linear":
          y = startIntensity + (endIntensity - startIntensity) * x;
          break;
        case "exponential":
          y = startIntensity + (endIntensity - startIntensity) * (x * x);
          break;
        case "s-curve":
          // Simple S-curve using sine function
          y = startIntensity + (endIntensity - startIntensity) * (0.5 + 0.5 * Math.sin(Math.PI * (x - 0.5)));
          break;
        default:
          y = startIntensity + (endIntensity - startIntensity) * x;
      }
      
      points.push({ x: x * 100, y });
    }
    
    return points;
  };
  
  const curvePoints = getCurvePoints();
  const svgHeight = 100;
  const svgWidth = 200;
  
  const pathCommand = curvePoints.map((point, i) => {
    const x = (point.x / 100) * svgWidth;
    const y = svgHeight - (point.y / 100) * svgHeight;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <div>
        <Label>Intensity Curve</Label>
        <Select 
          value={value.curve}
          onValueChange={(val) => handleCurveTypeChange(val as "linear" | "exponential" | "s-curve")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select curve type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="exponential">Exponential</SelectItem>
            <SelectItem value="s-curve">S-Curve</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Start Intensity: {value.startIntensity}%</Label>
        <Slider
          value={[value.startIntensity]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleStartIntensityChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label>End Intensity: {value.endIntensity}%</Label>
        <Slider
          value={[value.endIntensity]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleEndIntensityChange}
        />
      </div>

      <div className="pt-2">
        <div className="border rounded-md p-4 bg-background/50">
          <svg width={svgWidth} height={svgHeight} className="w-full">
            {/* Grid lines */}
            <line x1="0" y1={svgHeight} x2={svgWidth} y2={svgHeight} stroke="#ddd" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2={svgHeight} stroke="#ddd" strokeWidth="1" />
            
            {/* Curve path */}
            <path
              d={pathCommand}
              fill="none"
              stroke={value.color || "#4CAF50"}
              strokeWidth="2"
            />
            
            {/* Start point */}
            <circle
              cx="0"
              cy={svgHeight - (value.startIntensity / 100) * svgHeight}
              r="4"
              fill={value.color || "#4CAF50"}
            />
            
            {/* End point */}
            <circle
              cx={svgWidth}
              cy={svgHeight - (value.endIntensity / 100) * svgHeight}
              r="4"
              fill={value.color || "#4CAF50"}
            />
          </svg>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>Time</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
