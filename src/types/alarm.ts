
export type RecurrencePattern = {
  type: "daily" | "weekly" | "custom";
  days?: number[];  // 0-6 for weekly/custom (Sunday-Saturday)
  interval?: number; // For daily/custom (every X days)
  customDates?: string[]; // For custom dates in ISO format
};

export type IntensityCurve = {
  startIntensity: number; // 0-100
  endIntensity: number; // 0-100
  curve: "linear" | "exponential" | "s-curve"; // Type of curve
};

export type Alarm = {
  id: string;
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
