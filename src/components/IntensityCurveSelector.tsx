
import React from "react";
import { Label } from "@/components/ui/label";
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

  const handleCurveTypeChange = (curveType: "linear" | "quadratic" | "s-curve" | "asymptotic") => {
    onChange({
      ...value,
      curve: curveType,
    });
  };

  // Calculate points for the curve preview
  const getCurvePoints = () => {
    const { startIntensity, endIntensity, curve } = value;
    const points = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      let y: number;
      
      switch (curve) {
        default:
        case "linear":
          y = startIntensity + (endIntensity - startIntensity) * x;
          break;
        case "quadratic":
          y = startIntensity + (endIntensity - startIntensity) * (x * x);
          break;
        case "s-curve":
          // Simple S-curve using sine function
          y = startIntensity + (endIntensity - startIntensity) * (0.5 + 0.5 * Math.sin(Math.PI * (x - 0.5)));
          break;
        case "asymptotic":
          y = startIntensity + (endIntensity - startIntensity) * (1 - Math.exp(-x/0.25));
          break;
      }
      
      points.push({ x: x * 100, y });
    }
    
    return points;
  };
  
  const curvePoints = getCurvePoints();
  const svgHeight = 120;
  const svgWidth = Math.min(400, window.innerWidth*0.75);
  const padding = 10;


  
  const pathCommand = curvePoints.map((point, i) => {
    const x = (point.x / 100) * (svgWidth - padding) + padding/2;
    const y = (1 - point.y / 100) * (svgHeight - padding) + padding/2;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <div>
        <Label>Intensity Curve</Label>
        <Select 
          value={value.curve}
          onValueChange={(val) => handleCurveTypeChange(val as "linear" | "asymptotic" | "s-curve" | "quadratic")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select curve type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="quadratic">Quadratic</SelectItem>
            <SelectItem value="s-curve">S-Curve</SelectItem>
            <SelectItem value="asymptotic">Asymptotic</SelectItem>
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
            <line x1={padding/2} y1={svgHeight-padding/2} x2={svgWidth-padding/2} y2={svgHeight-padding/2} stroke="#ddd" strokeWidth="1" />
            <line x1={padding/2} y1={padding/2} x2={padding/2} y2={svgHeight-padding/2} stroke="#ddd" strokeWidth="1" />
            
            {/* Curve path */}
            <path
              d={pathCommand}
              fill="none"
              stroke="#4CAF50"
              strokeWidth="2"
            />
            
            {/* Start point */}
            <circle
              cx={padding/2}
              cy={(1 - value.startIntensity / 100) * (svgHeight - padding) + padding/2}
              r="4"
              fill="#4CAF50"
            />
            
            {/* End point */}
            <circle
              cx={svgWidth - padding/2}
              cy={(1 - value.endIntensity / 100) * (svgHeight - padding) + padding/2}
              r="4"
              fill="#4CAF50"
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
