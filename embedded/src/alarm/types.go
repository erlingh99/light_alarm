package alarm

import (
	"time"
	"strings"
)

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
	CreatedAt       CustomTime        `json:"createdAt"`
	UpdatedAt       CustomTime     	  `json:"updatedAt"`
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
	Type        string      `json:"type"`        	   // "daily", "weekly", "custom"
	Days        []int       `json:"days,omitempty"`    // 0-6 for weekly (Monday-Sunday)
	CustomDates []Date 		`json:"customDates,omitempty"`  // Custom dates in YYYY-MM-DD
} 

//below are structures that handle the parsing of time stamps
type Date struct {
	time.Time
}

func (cd *Date) UnmarshalJSON(b []byte) (err error) {
	s := strings.Trim(string(b), "\"")
	if s == "null" {
		cd.Time = time.Time{}
		return
	}
	cd.Time, err = time.Parse(time.DateOnly, s)
	return
}

type CustomTime struct {
	time.Time
}

func (ct *CustomTime) UnmarshalJSON(b []byte) (err error) {
	s := strings.Trim(string(b), "\"")
	if s == "null" {
		ct.Time = time.Time{}
		return
	}
	ct.Time, err = time.Parse("2006-01-02T15:04:05.999999999", s)
	return
}