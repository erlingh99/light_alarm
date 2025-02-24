
export type RecurrencePattern = {
  type: "daily" | "weekly" | "custom";
  days?: number[];  // 0-6 for weekly/custom (Sunday-Saturday)
  interval?: number; // For daily/custom (every X days)
};

export type Alarm = {
  id: string;
  name: string;
  time: string;
  isActive: boolean;
  recurrence: RecurrencePattern;
  createdAt: string;
  updatedAt: string;
};
