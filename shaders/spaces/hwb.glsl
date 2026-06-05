vec3 hwb_to_xyz(vec3 hwb) {
    float h = hwb.x;
    float w = hwb.y;
    float b = hwb.z;

    float sum = w + b;
    if (sum > 1.0) {
        w /= sum;
        b /= sum;
    }

    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

    rgb = rgb * (1.0 - w - b) + w;

    return srgbToXyz(rgb);
}

vec3 xyz_to_hwb(vec3 xyz) {
    vec3 rgb = clamp(xyzToSrgb(xyz), 0.0, 1.0);

    float maxVal = max(rgb.r, max(rgb.g, rgb.b));
    float minVal = min(rgb.r, min(rgb.g, rgb.b));
    float d = maxVal - minVal;

    float h = 0.0;
    if (d > EPS_PRECISION) {
        if (maxVal == rgb.r) {
            h = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6.0 : 0.0);
        } else if (maxVal == rgb.g) {
            h = (rgb.b - rgb.r) / d + 2.0;
        } else {
            h = (rgb.r - rgb.g) / d + 4.0;
        }
        h /= 6.0;
    }

    float w = clamp(minVal, 0.0, 1.0);
    float b = clamp(1.0 - maxVal, 0.0, 1.0);

    return vec3(h, w, b);
}