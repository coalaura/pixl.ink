vec3 cielch_to_xyz(vec3 lch) {
    float l = lch.x * 100.0;
    float c = lch.y * 160.0;
    float h = lch.z;

    float a = c * cos(h * TAU);
    float b = c * sin(h * TAU);

    float fy = (l + 16.0) / 116.0;
    float fx = a / 500.0 + fy;
    float fz = fy - b / 200.0;

    float fx3 = fx * fx * fx;
    float fz3 = fz * fz * fz;

    float xr = fx3 > LAB_EPSILON ? fx3 : fLabInv(fx);
    float yr = l > 8.0 ? fx3 : l / LAB_KAPPA;
    float yr_val = l > 8.0 ? fy * fy * fy : l / LAB_KAPPA;
    float zr = fz3 > LAB_EPSILON ? fz3 : fLabInv(fz);

    vec3 wp = getWhitepointXYZ(u_whitepoint, u_observer);

    return vec3(xr * wp.x, yr_val * wp.y, zr * wp.z);
}

vec3 xyz_to_cielch(vec3 xyz) {
    vec3 wp = getWhitepointXYZ(u_whitepoint, u_observer);

    float xr = zdiv(xyz.x, wp.x);
    float yr = zdiv(xyz.y, wp.y);
    float zr = zdiv(xyz.z, wp.z);

    float fx = fLab(xr);
    float fy = fLab(yr);
    float fz = fLab(zr);

    float l = 116.0 * fy - 16.0;
    float a = 500.0 * (fx - fy);
    float b = 200.0 * (fy - fz);

    float c = sqrt(a * a + b * b);
    float cNorm = c / 160.0;

    bool isAch = cNorm < EPS_PERCEPTUAL;

    float h = isAch ? 0.0 : mod(atan(b, a) / TAU + 1.0, 1.0);

    return vec3(
        clamp(l / 100.0, 0.0, 1.0),
        clamp(cNorm, 0.0, 1.0),
        h
    );
}