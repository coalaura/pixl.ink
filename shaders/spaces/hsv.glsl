vec3 hsv_to_xyz(vec3 hsv) {
    float h = hsv.x;
    float s = hsv.y;
    float v = hsv.z;

    float h6 = h * 6.0;
    float i_f = floor(h6);
    int i = int(mod(i_f, 6.0));
    float f = h6 - i_f;

    float p = v * (1.0 - s);
    float q = v * (1.0 - f * s);
    float t = v * (1.0 - (1.0 - f) * s);

    float r = 0.0;
    float g = 0.0;
    float b = 0.0;

    if (i == 0) {
        r = v;
        g = t;
        b = p;
    } else if (i == 1) {
        r = q;
        g = v;
        b = p;
    } else if (i == 2) {
        r = p;
        g = v;
        b = t;
    } else if (i == 3) {
        r = p;
        g = q;
        b = v;
    } else if (i == 4) {
        r = t;
        g = p;
        b = v;
    } else {
        r = v;
        g = p;
        b = q;
    }

    return srgbToXyz(vec3(r, g, b));
}

vec3 xyz_to_hsv(vec3 xyz) {
    vec3 v3 = xyzToSrgb(xyz);
    bool skip_clamp = (u_clamped == 0);
    vec3 rgb = clamp_skip(v3, 0.0, 1.0, skip_clamp);

    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;

    float maxVal = max(r, max(g, b));
    float minVal = min(r, min(g, b));
    float d = maxVal - minVal;

    float v = maxVal;
    float s = (maxVal == 0.0) ? 0.0 : d / maxVal;

    if (s <= EPS_PRECISION) {
        return vec3(0.0, 0.0, v);
    }

    float h = 0.0;
    if (maxVal == r) {
        h = zdiv(g - b, d) + (g < b ? 6.0 : 0.0);
    } else if (maxVal == g) {
        h = zdiv(b - r, d) + 2.0;
    } else {
        h = zdiv(r - g, d) + 4.0;
    }

    h /= 6.0;

    return vec3(h, s, v);
}