package alarm

import "time"

// Alarm represents an alarm configuration
type Alarm struct {
	ID              string            `json:"id"`
	Name            string            `json:"name"`
	Time            string            `json:"time"`
	Color           string            `json:"color"`
	Length          int               `json:"length"`
	IntensityCurve  IntensityCurve    `json:"intensityCurve"`
	Recurrence      RecurrencePattern `json:"recurrence"`
	IsActive        bool              `json:"isActive"`
	CreatedAt       time.Time         `json:"createdAt"`
	UpdatedAt       time.Time     	  `json:"updatedAt"`
}

// IntensityCurve defines how the alarm intensity changes over time
type IntensityCurve struct {
	StartIntensity  int      `json:"startIntensity"`  // 0-100
	EndIntensity    int      `json:"endIntensity"`    // 0-100
	Curve           string   `json:"curve"`           // "linear", "asymptotic", "s-curve", "custom"
	HyperParameter  *int     `json:"hyperParameter,omitempty"`  // Curve-specific parameter
	ControlPoints   []Point  `json:"controlPoints,omitempty"`   // Custom curve control points
}

// Point represents a control point in a custom curve
type Point struct {
	X float64 `json:"x"` // Time position (0-100)
	Y float64 `json:"y"` // Intensity value (0-100)
}

// RecurrencePattern defines how the alarm repeats
type RecurrencePattern struct {
	Type        string      `json:"type"`        		   // "daily", "weekly", "custom"
	Days        []int       `json:"days,omitempty"`        // 0-6 for weekly (Monday-Sunday)
	CustomDates []time.Time `json:"customDates,omitempty"` // Custom dates in ISO format
} 