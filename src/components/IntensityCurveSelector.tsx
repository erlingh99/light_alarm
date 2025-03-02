
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntensityCurve } from "@/types/alarm";
import { ChevronDown, ChevronUp } from "lucide-react";

interface IntensityCurveSelectorProps {
  value: IntensityCurve;
  onChange: (curve: IntensityCurve) => void;
}

export const IntensityCurveSelector: React.FC<IntensityCurveSelectorProps> = ({
  value,
  onChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const handleCurveTypeChange = (curveType: "linear" | "s-curve" | "asymptotic") => {
    // Set default hyper-parameter based on curve type
    let hyperParameter: number | undefined;
    if (curveType === "s-curve") hyperParameter = 10; // Default sharpness
    else if (curveType === "asymptotic") hyperParameter = 10; // Default decay rate
    
    onChange({
      ...value,
      curve: curveType,
      hyperParameter,
    });
  };

  const handleHyperParameterChange = (newValue: number) => {
    onChange({
      ...value,
      hyperParameter: newValue,
    });
  };

  // Get description and range for the current curve's hyper-parameter
  const getHyperParameterInfo = () => {
    switch (value.curve) {
      case "s-curve":
        return {
          name: "Sharpness",
          description: "Controls how sharp the S-curve transition is (higher = sharper)",
          min: 1,
          max: 50,
          step: 1,
          default: 10,
          disabled: false,
        };
      case "asymptotic":
        return {
          name: "Decay Rate",
          description: "Controls how quickly the curve approaches its asymptote (higher = faster)",
          min: -50,
          max: 50,
          step: 1,
          default: 10,
          disabled: false,
        };
      default:
        return {
          name: "Parameter",
          description: "No adjustable parameters for this curve type",
          min: 0,
          max: 1,
          step: 0.1,
          default: 0,
          disabled: true,
        };
    }
  };

  const hyperParam = getHyperParameterInfo();

  // Calculate points for the curve preview
  const getCurvePoints = () => {
    const { startIntensity, endIntensity, curve, hyperParameter } = value;
    const points = [];
    const steps = 50;
    
    // Use default or current hyperParameter value
    const param = hyperParameter !== undefined ? hyperParameter : 
      (curve === "s-curve" ? 10 : curve === "asymptotic" ? 4 : 0);
    
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      let y: number;
      
      switch (curve) {
        case "asymptotic":
          if (param) {
            y = startIntensity + (endIntensity - startIntensity) * (1 - Math.exp(-x*param*0.4))/(1 - Math.exp(-param*0.4));
            break;
          }
          //falls through when param is 0
        default:
        case "linear":
          y = startIntensity + (endIntensity - startIntensity) * x;
          break;
        case "s-curve":
          y = startIntensity + (endIntensity - startIntensity) * (Math.exp(param * x) - 1) / ((Math.exp(0.5*param) - 1)*(1 + Math.exp(param * (x - 0.5))));
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
          onValueChange={(val) => handleCurveTypeChange(val as "linear" | "asymptotic" | "s-curve")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select curve type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
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

      <div className="flex items-center space-x-2 cursor-pointer text-sm text-muted-foreground">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          Advanced Settings
        </button>
      </div>

      {showAdvanced && (
        <div className="pl-4 pt-2 pb-2 border-l-2 border-muted space-y-3">
          <div className="space-y-1">
            <Label className={hyperParam.disabled ? "text-muted-foreground" : ""}>
              {hyperParam.name} {!hyperParam.disabled && value.hyperParameter !== undefined && `(${value.hyperParameter.toFixed(2)})`}
            </Label>
            <div className="text-xs text-muted-foreground mb-2">{hyperParam.description}</div>
            
            <Slider
              value={[value.hyperParameter !== undefined ? value.hyperParameter : hyperParam.default]}
              min={hyperParam.min}
              max={hyperParam.max}
              step={hyperParam.step}
              onValueChange={(values) => handleHyperParameterChange(values[0])}
              disabled={hyperParam.disabled}
              className={hyperParam.disabled ? "opacity-50" : ""}
            />
          </div>
        </div>
      )}

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
