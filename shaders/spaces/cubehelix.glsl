vec3 cubehelix_to_xyz(vec3 hsl) {
    const float A = -0.14861;
    const float B = 1.78277;
    const float C = -0.29227;
    const float D = -0.90649;
    const float E = 1.97294;
    const float S_MAX = 4.614386868039719;

    float hDeg = hsl.x * 360.0;
    float sPhys = hsl.y * S_MAX;
    float l = hsl.z;

    float sUse = (l == 0.0 || l == 1.0) ? 0.0 : sPhys;

    float hRad = (hDeg + 120.0) * DEG2RAD;
    float cosh = cos(hRad);
    float sinh = sin(hRad);

    float a = sUse * l * (1.0 - l);

    float r = l + a * (A * cosh + B * sinh);
    float g = l + a * (C * cosh + D * sinh);
    float b = l + a * (E * cosh);

    return srgbToXyz(vec3(r, g, b));
}

vec3 xyz_to_cubehelix(vec3 xyz) {
    const float A = -0.14861;
    const float B = 1.78277;
    const float C = -0.29227;
    const float D = -0.90649;
    const float E = 1.97294;
    const float ED = -1.7884503806;
    const float EB = 3.5172982438;
    const float BC_DA = -0.6557636667999999;
    const float S_MAX = 4.614386868039719;

    vec3 v3 = xyzToSrgb(xyz);

    float r = clamp_skip(v3.x, 0.0, 1.0, u_clamped == 0);
    float g = clamp_skip(v3.y, 0.0, 1.0, u_clamped == 0);
    float b = clamp_skip(v3.z, 0.0, 1.0, u_clamped == 0);

    float denomL = BC_DA + ED - EB;

    float l = 0.0;

    if (abs(denomL) > EPS_PRECISION) {
        l = (BC_DA * b + ED * r - EB * g) / denomL;
    }

    l = clamp_skip(l, 0.0, 1.0, u_clamped == 0);

    float bl = b - l;

    float k = 0.0;

    if (abs(D) > EPS_PRECISION) {
        k = (E * (g - l) - C * bl) / D;
    }

    float sPhys = 0.0;

    if (l > 0.0 && l < 1.0) {
        float amp = length(vec2(k, bl));
        float denomS = E * l * (1.0 - l);

        if (denomS > EPS_PRECISION) {
            sPhys = amp / denomS;
        }
    }

    float hDeg = 0.0;

    if (sPhys > EPS_PRECISION) {
        hDeg = atan(k, bl) * RAD2DEG - 120.0;
        hDeg = normalizeAngle360(hDeg);
    }

    float hOut = hDeg / 360.0;
    float sOut = max(0.0, sPhys / S_MAX);
    float lOut = l;

    return vec3(
        clamp_skip(hOut, 0.0, 1.0, u_clamped == 0),
        clamp_skip(sOut, 0.0, 1.0, u_clamped == 0),
        clamp_skip(lOut, 0.0, 1.0, u_clamped == 0)
    );
}
