package alarm

import "math"

// applyIntensityCurve calculates the current intensity based on curve type and progress
func applyIntensityCurve(curve IntensityCurve, progress float64) int {
	switch curve.Curve {
	case "linear":
		return calculateLinearIntensity(curve, progress)
	case "asymptotic":
		return calculateAsymptoticIntensity(curve, progress)
	case "s-curve":
		return calculateSCurveIntensity(curve, progress)
	case "custom":
		return calculateCustomIntensity(curve, progress)
	default:
		return curve.StartIntensity
	}
}

func calculateLinearIntensity(curve IntensityCurve, progress float64) int {
	return int(float64(curve.StartIntensity) + 
		(float64(curve.EndIntensity-curve.StartIntensity) * progress))
}

func calculateAsymptoticIntensity(curve IntensityCurve, progress float64) int {
	param := 4.0 // Default value from frontend
	if curve.HyperParameter != nil {
		param = float64(*curve.HyperParameter)
	}

	if param != 0 {
		numerator := 1.0 - math.Exp(-progress*param*0.4)
		denominator := 1.0 - math.Exp(-param*0.4)
		factor := numerator / denominator
		return int(float64(curve.StartIntensity) + 
			float64(curve.EndIntensity-curve.StartIntensity) * factor)
	}
	
	// Fall back to linear if param is 0
	return calculateLinearIntensity(curve, progress)
}

func calculateSCurveIntensity(curve IntensityCurve, progress float64) int {
	param := 10.0 // Default value from frontend
	if curve.HyperParameter != nil {
		param = float64(*curve.HyperParameter)
	}

	numerator := math.Exp(param*progress) - 1
	denominator := (math.Exp(0.5*param) - 1) * (1 + math.Exp(param*(progress-0.5)))
	factor := numerator / denominator

	return int(float64(curve.StartIntensity) + 
		float64(curve.EndIntensity-curve.StartIntensity) * factor)
}

func calculateCustomIntensity(curve IntensityCurve, progress float64) int {
	if len(curve.ControlPoints) == 0 {
		return calculateLinearIntensity(curve, progress)
	}

	// Create points array with start and end points
	points := make([]Point, 0, len(curve.ControlPoints)+2)
	points = append(points, Point{X: 0, Y: float64(curve.StartIntensity)})
	points = append(points, curve.ControlPoints...)
	points = append(points, Point{X: 100, Y: float64(curve.EndIntensity)})

	// Find the segment where progress falls
	progress100 := progress * 100
	for i := 0; i < len(points)-1; i++ {
		if progress100 >= points[i].X && progress100 <= points[i+1].X {
			// Get points for Catmull-Rom calculation
			p0 := points[max(0, i-1)]
			p1 := points[i]
			p2 := points[i+1]
			p3 := points[min(len(points)-1, i+2)]

			// Calculate t in [0,1] for the current segment
			t := (progress100 - p1.X) / (p2.X - p1.X)

			// Catmull-Rom calculation
			t2 := t * t
			t3 := t2 * t

			y := 0.5 * (
				(2*p1.Y) +
				(-p0.Y+p2.Y)*t +
				(2*p0.Y-5*p1.Y+4*p2.Y-p3.Y)*t2 +
				(-p0.Y+3*p1.Y-3*p2.Y+p3.Y)*t3)

			return int(y)
		}
	}

	return curve.EndIntensity
}

// Helper functions
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}