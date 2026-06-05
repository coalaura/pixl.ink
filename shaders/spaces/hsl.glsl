float hsl_hue2rgb(float p, float q, float t) {
    if (t < 0.0) {
        t += 1.0;
    }

    if (t > 1.0) {
        t -= 1.0;
    }

    if (t < 1.0 / 6.0) {
        return p + (q - p) * 6.0 * t;
    }

    if (t < 1.0 / 2.0) {
        return q;
    }

    if (t < 2.0 / 3.0) {
        return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    }

    return p;
}

vec3 hsl_to_xyz(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    float r, g, b;

    if (s == 0.0) {
        r = l;
        g = l;
        b = l;
    } else {
        float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
        float p = 2.0 * l - q;

        r = hsl_hue2rgb(p, q, h + 1.0 / 3.0);
        g = hsl_hue2rgb(p, q, h);
        b = hsl_hue2rgb(p, q, h - 1.0 / 3.0);
    }

    return srgbToXyz(vec3(r, g, b));
}

vec3 xyz_to_hsl(vec3 xyz) {
    bool skip = (u_clamped == 0);
    vec3 rgb = clamp_skip(xyzToSrgb(xyz), 0.0, 1.0, skip);

    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;

    float maxVal = max(r, max(g, b));
    float minVal = min(r, min(g, b));
    float d = maxVal - minVal;

    float h = 0.0;
    float s = 0.0;
    float l = (maxVal + minVal) / 2.0;

    if (d < EPS_PRECISION) {
        s = 0.0;
        h = 0.0;
    } else {
        if (l <= EPS_PRECISION || l >= 1.0 - EPS_PRECISION) {
            s = 0.0;
        } else {
            s = l < 0.5 ? d / (maxVal + minVal) : d / (2.0 - maxVal - minVal);
        }

        if (maxVal == r) {
            h = (g - b) / d + (g < b ? 6.0 : 0.0);
        } else if (maxVal == g) {
            h = (b - r) / d + 2.0;
        } else {
            h = (r - g) / d + 4.0;
        }

        h /= 6.0;
    }

    return vec3(
        h,
        clamp_skip(s, 0.0, 1.0, skip),
        clamp_skip(l, 0.0, 1.0, skip)
    );
}