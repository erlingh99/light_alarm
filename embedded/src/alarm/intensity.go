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
	speed := 2.0
	if curve.HyperParameter != nil {
		speed = float64(*curve.HyperParameter)
	}
	factor := 1 - 1/(1+speed*progress)
	return int(float64(curve.StartIntensity) + 
		float64(curve.EndIntensity-curve.StartIntensity) * factor)
}

func calculateSCurveIntensity(curve IntensityCurve, progress float64) int {
	x := (progress - 0.5) * 6 // Scale to make transition steeper
	factor := 1 / (1 + math.Exp(-x))
	return int(float64(curve.StartIntensity) + 
		float64(curve.EndIntensity-curve.StartIntensity) * factor)
}

func calculateCustomIntensity(curve IntensityCurve, progress float64) int {
	if len(curve.ControlPoints) < 2 {
		return curve.StartIntensity
	}

	// Find surrounding control points
	var p1, p2 Point
	for i, point := range curve.ControlPoints {
		if point.X/100 > progress {
			if i == 0 {
				return curve.StartIntensity
			}
			p1 = curve.ControlPoints[i-1]
			p2 = point
			break
		}
	}
	if p2.X == 0 { // We reached the end
		return curve.EndIntensity
	}

	// Linear interpolation between control points
	t := (progress - p1.X/100) / (p2.X/100 - p1.X/100)
	return int(p1.Y + (p2.Y-p1.Y)*t)
}