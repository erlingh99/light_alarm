
export type RecurrencePattern = {
  type: "daily" | "weekly" | "custom";
  days?: number[];  // 0-6 for weekly (Monday-Sunday)
  customDates?: string[]; // For custom dates in ISO format
};

export type IntensityCurve = {
  startIntensity: number; // 0-100
  endIntensity: number; // 0-100
  curve: "linear" | "asymptotic" | "s-curve"; // Type of curve
  hyperParameter?: number; // Curve-specific parameter (e.g., sharpness for s-curve, decay rate for asymptotic)
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
