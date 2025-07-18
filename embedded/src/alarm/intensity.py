import math

# Linear interpolation
def linear(start, end, t):
    return start + (end - start) * t

# S-curve (logistic)
def s_curve(start, end, t, sharpness=10):
    # t in [0,1], sharpness controls steepness
    s = 1 / (1 + math.exp(-sharpness * (t - 0.5)))
    s0 = 1 / (1 + math.exp(-sharpness * (-0.5)))
    s1 = 1 / (1 + math.exp(-sharpness * (0.5)))
    norm = (s - s0) / (s1 - s0)
    return start + (end - start) * norm

# Asymptotic (exponential approach)
def asymptotic(start, end, t, decay=5):
    # t in [0,1], decay controls how fast it approaches end
    return start + (end - start) * (1 - math.exp(-decay * t)) / (1 - math.exp(-decay))

# Catmull-Rom spline for custom curve
def catmull_rom(points, t):
    # points: list of (x, y), t in [0,1]
    n = len(points)
    if n < 2:
        return points[0][1] if n == 1 else 0
    # Find segment
    seg = min(int(t * (n - 1)), n - 2)
    t0 = seg / (n - 1)
    t1 = (seg + 1) / (n - 1)
    local_t = (t - t0) / (t1 - t0)
    # Get control points
    p0 = points[max(seg - 1, 0)][1]
    p1 = points[seg][1]
    p2 = points[seg + 1][1]
    p3 = points[min(seg + 2, n - 1)][1]
    # Catmull-Rom formula
    return 0.5 * (
        2 * p1 +
        (-p0 + p2) * local_t +
        (2*p0 - 5*p1 + 4*p2 - p3) * local_t**2 +
        (-p0 + 3*p1 - 3*p2 + p3) * local_t**3
    )

def get_intensity(curve_type, start, end, t, hyper=None, points=None):
    if curve_type == 0:  # Linear
        return linear(start, end, t)
    elif curve_type == 1:  # Asymptotic
        return asymptotic(start, end, t, decay=hyper or 5)
    elif curve_type == 2:  # S-curve
        return s_curve(start, end, t, sharpness=hyper or 10)
    elif curve_type == 3 and points:  # Custom
        return catmull_rom(points, t)
    else:
        return linear(start, end, t)
