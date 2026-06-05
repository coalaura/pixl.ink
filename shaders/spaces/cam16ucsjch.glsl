vec3 cam16ucsjch_to_xyz(vec3 jch) {
    float Jp = jch.x * 100.0;
    float Cp = jch.y * 50.0;
    float hDeg = jch.z * 360.0;

    float hRad = hDeg * DEG2RAD;
    float ap = Cp * cos(hRad);
    float bp = Cp * sin(hRad);

    float aNorm = ap / 100.0 + 0.5;
    float bNorm = bp / 100.0 + 0.5;

    return cam16ucs_to_xyz(vec3(Jp / 100.0, aNorm, bNorm));
}

vec3 xyz_to_cam16ucsjch(vec3 xyz) {
    vec3 jab = xyz_to_cam16ucs(xyz);

    float Jp = jab.x * 100.0;
    float ap = (jab.y - 0.5) * 100.0;
    float bp = (jab.z - 0.5) * 100.0;

    float Cp = length(vec2(ap, bp));

    float hDeg = 0.0;
    if (Cp > EPS_PRECISION) {
        hDeg = normalizeAngle360(atan(bp, ap) * RAD2DEG);
    }

    return vec3(
        clamp(Jp / 100.0, 0.0, 1.0),
        clamp(Cp / 50.0, 0.0, 1.0),
        clamp(hDeg / 360.0, 0.0, 1.0)
    );
}