
export type RecurrencePattern = {
  type: "daily" | "weekly" | "custom";
  days?: number[];  // 0-6 for weekly (Monday-Sunday)
  customDates?: string[]; // For custom dates in ISO format
};

export type IntensityCurve = {
  startIntensity: number; // 0-100
  endIntensity: number; // 0-100
  curve: "linear" | "asymptotic" | "s-curve" | "custom"; // Type of curve
  hyperParameter?: number; // Curve-specific parameter (e.g., sharpness for s-curve, decay rate for asymptotic)
  controlPoints?: Array<{x: number, y: number}>; // Control points for custom curve (x: 0-100, y: 0-100)
};

export type Alarm = {
  id: number;
  name: string;
  time: string;
  color: string; // Hex color code
  length: number; // Length in minutes
  intensityCurve: IntensityCurve;
  isActive: boolean;
  recurrence: RecurrencePattern;
  createdAt: string;
  updatedAt: string;
};
