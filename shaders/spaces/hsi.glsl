vec3 hsi_to_xyz(vec3 hsi) {
    float h = hsi.x;
    float s = hsi.y;
    float i = hsi.z;

    float r = 0.0;
    float g = 0.0;
    float b = 0.0;

    if (s < EPS_PRECISION) {
        r = i;
        g = i;
        b = i;
    } else {
        float h_deg = normalizeAngle360(h * 360.0);
        float sect = floor(h_deg / 120.0);
        float h_in = h_deg - sect * 120.0;

        float cosH = cos(h_in * DEG2RAD);
        float cosA = cos((60.0 - h_in) * DEG2RAD);
        float ratio = abs(cosA) < EPS_PRECISION ? 0.0 : (s * cosH) / cosA;

        if (sect == 0.0) {
            b = i * (1.0 - s);
            r = i * (1.0 + ratio);
            g = 3.0 * i - (r + b);
        } else if (sect == 1.0) {
            r = i * (1.0 - s);
            g = i * (1.0 + ratio);
            b = 3.0 * i - (r + g);
        } else {
            g = i * (1.0 - s);
            b = i * (1.0 + ratio);
            r = 3.0 * i - (g + b);
        }
    }

    return srgbToXyz(vec3(r, g, b));
}

vec3 xyz_to_hsi(vec3 xyz) {
    vec3 v3 = xyzToSrgb(xyz);

    bool unclamped = (u_clamped == 0);
    float r = clamp_skip(v3.r, 0.0, 1.0, unclamped);
    float g = clamp_skip(v3.g, 0.0, 1.0, unclamped);
    float b = clamp_skip(v3.b, 0.0, 1.0, unclamped);

    float i = (r + g + b) / 3.0;

    float h = 0.0;
    float s = 0.0;

    if (abs(r - g) < EPS_PRECISION && abs(g - b) < EPS_PRECISION) {
        h = 0.0;
        s = 0.0;
    } else {
        float alpha = 0.5 * (2.0 * r - g - b);
        float beta = 0.8660254037844386 * (g - b);

        h = atan(beta, alpha) / TAU;

        if (h < 0.0) {
            h += 1.0;
        }

        s = abs(i) < EPS_PRECISION ? 0.0 : 1.0 - min(min(r, g), b) / i;
    }

    return vec3(
        h,
        clamp_skip(s, 0.0, 1.0, unclamped),
        clamp_skip(i, 0.0, 1.0, unclamped)
    );
}