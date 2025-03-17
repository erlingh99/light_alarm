
import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntensityCurve } from "@/types/alarm";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_INIT_CUSTOM, DEFAULT_PARAM_ASYMP, DEFAULT_PARAM_S_CURVE } from "@/consts";

interface IntensityCurveSelectorProps {
  value: IntensityCurve;
  onChange: (curve: IntensityCurve) => void;
}

export const IntensityCurveSelector: React.FC<IntensityCurveSelectorProps> = ({
  value,
  onChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  const handleCurveTypeChange = (curveType: "linear" | "s-curve" | "asymptotic" | "custom") => {
    // Set default hyper-parameter based on curve type
    let hyperParameter: number | undefined;
    let initialPoints: Array<{x: number, y: number}> | undefined

    if (curveType === "s-curve") hyperParameter = DEFAULT_PARAM_S_CURVE; // Default sharpness
    else if (curveType === "asymptotic") hyperParameter = DEFAULT_PARAM_ASYMP; // Default decay rate
    else if (curveType === "custom") initialPoints = DEFAULT_INIT_CUSTOM;
    
    onChange({
      ...value,
      curve: curveType,
      hyperParameter,
      controlPoints: initialPoints
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
      case "custom":
        return {
          name: "Curve Editing",
          description: "Drag points to create a custom curve shape",
          min: 0,
          max: 1,
          step: 0.1,
          default: 0,
          disabled: true,
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

  // Calculate cubic spline for custom curve
  const calculateCubicSpline = (points: Array<{x: number, y: number}>) => {
       
    // Add start and end points based on startIntensity and endIntensity
    const allPoints = [
      { x: 0, y: value.startIntensity },
      ...points,
      { x: 100, y: value.endIntensity }
    ].sort((a, b) => a.x - b.x);
    
    const pathPoints: Array<{x: number, y: number}> = [];
    // For a simple cubic spline implementation, we'll use Catmull-Rom spline
    // which passes through all control points
       
    for (let i = 0; i < allPoints.length - 1; i++) {
      const p0 = i > 0 ? allPoints[i - 1] : allPoints[0];
      const p1 = allPoints[i];
      const p2 = allPoints[i + 1];
      const p3 = i < allPoints.length - 2 ? allPoints[i + 2] : allPoints[i + 1];
      
      // Draw a smooth curve for each segment
      for (let t = 0; t <= 1; t += 0.1) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        // Catmull-Rom calculations
        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );
        pathPoints.push({x, y})
      }
    }
    return pathPoints;
  };

  // Calculate points for the curve preview
  const getCurvePoints = () => {
    const { startIntensity, endIntensity, curve, hyperParameter, controlPoints } = value;
        
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
      
      points.push({ x: x*100, y });
    }
    
    return points;
  };
  
  // Handle mouse events for custom curve editing
  const svgHeight = 120;
  const svgWidth = typeof window !== 'undefined' ? Math.min(400, window.innerWidth*0.75) : 400;
  const padding = 10;

  const getSvgCoordinates = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svgRect = svgRef.current.getBoundingClientRect();
    let x = ((event.clientX - svgRect.left) / (svgRect.right - svgRect.left)) * 100;
    let y = 100 - ((event.clientY - svgRect.top) / (svgRect.bottom - svgRect.top)) * 100;
    
    // Constrain x to be between 1 and 99 to ensure points can't overlap start/end
    x = Math.max(1, Math.min(99, x));
    // Constrain y to be between 0 and 100
    y = Math.max(0, Math.min(100, y));
    
    return { x, y };
  };

  const handleSvgMouseDown = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (value.curve !== "custom") return;
    
    const coords = getSvgCoordinates(event);
    const controlPoints = value.controlPoints || [];
    
    // Check if we're near an existing point (to move it)
    const pointIndex = controlPoints.findIndex(point => {
      const distance = Math.sqrt(Math.pow(point.x - coords.x, 2) + Math.pow(point.y - coords.y, 2));
      return distance < 20; // 10 is the "snap" distance
    });
    
    if (pointIndex >= 0) {
      // We're on an existing point, prepare to move it
      setActivePointIndex(pointIndex);
      setIsDragging(true);
    } else {
      // We're adding a new point
      const newPoints = [...controlPoints, coords].sort((a, b) => a.x - b.x);
      onChange({
        ...value,
        controlPoints: newPoints
      });
    }
  };

  const handleSvgMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isDragging || activePointIndex === null || value.curve !== "custom") return;
    
    const coords = getSvgCoordinates(event);
    const controlPoints = [...(value.controlPoints || [])];
    
    // Update the position of the active point
    controlPoints[activePointIndex] = coords;
    
    // Re-sort points by x-coordinate
    const sortedPoints = controlPoints.sort((a, b) => a.x - b.x);
    
    onChange({
      ...value,
      controlPoints: sortedPoints
    });
  };

  const handleSvgMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setActivePointIndex(null);
    }
  };

  const handleDeletePoint = (index: number) => {
    if (!value.controlPoints) return;
    
    const newPoints = [...value.controlPoints];
    newPoints.splice(index, 1);
    
    onChange({
      ...value,
      controlPoints: newPoints
    });
  };

  // Draw curve based on points or spline
  let curvePoints = []
  if (value.curve === "custom")
    curvePoints = calculateCubicSpline(value.controlPoints || []);
  else
    curvePoints = getCurvePoints();

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
          onValueChange={(val) => handleCurveTypeChange(val as "linear" | "asymptotic" | "s-curve" | "custom")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select curve type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="s-curve">S-Curve</SelectItem>
            <SelectItem value="asymptotic">Asymptotic</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="space-y-1">
          <Label className={hyperParam.disabled ? "text-muted-foreground" : ""}>
            {hyperParam.name} {!hyperParam.disabled && value.hyperParameter !== undefined && `: ${value.hyperParameter.toFixed(0)}`}
          </Label>
          <div className="text-xs text-muted-foreground mb-2">{hyperParam.description}</div>
          
          {value.curve !== "custom" && (
            <Slider
              value={[value.hyperParameter !== undefined ? value.hyperParameter : hyperParam.default]}
              min={hyperParam.min}
              max={hyperParam.max}
              step={hyperParam.step}
              onValueChange={(values) => handleHyperParameterChange(values[0])}
              disabled={hyperParam.disabled}
              className={hyperParam.disabled ? "opacity-50" : ""}
            />
          )}

          {value.curve === "custom" && (
            <div className="text-xs text-muted-foreground mt-1">
              • Click on the graph to add control points<br />
              • Drag points to adjust the curve<br />
              • Double-click a point to remove it
            </div>
          )}
        </div>
      </div>
      )}

      <div className="pt-2">
        <div className="border rounded-md p-4 bg-background/50">
          <svg 
            ref={svgRef}
            width={svgWidth} 
            height={svgHeight} 
            className={cn(
              "w-full", 
              value.curve === "custom" && "cursor-pointer"
            )}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
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

            {/* Control points for custom curve */}
            {value.curve === "custom" && value.controlPoints && value.controlPoints.map((point, index) => (
              <g key={index} onDoubleClick={() => handleDeletePoint(index)}>
                <circle
                  cx={(point.x / 100) * (svgWidth - padding) + padding/2}
                  cy={(1 - point.y / 100) * (svgHeight - padding) + padding/2}
                  r="5"
                  fill={activePointIndex === index ? "#2a9134" : "#4CAF50"}
                  stroke="#fff"
                  strokeWidth="1.5"
                  className="cursor-move"
                />
              </g>
            ))}
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
