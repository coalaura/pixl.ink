vec3 cam02ucsjch_to_xyz(vec3 jch) {
    float hRad = jch.z * TAU;
    float Cp = jch.y * 50.0;

    float ap = Cp * cos(hRad);
    float bp = Cp * sin(hRad);

    vec3 jab = vec3(
        jch.x,
        ap / 100.0 + 0.5,
        bp / 100.0 + 0.5
    );

    return cam02ucs_to_xyz(jab);
}

vec3 xyz_to_cam02ucsjch(vec3 xyz) {
    vec3 jab = xyz_to_cam02ucs(xyz);

    float ap = (jab.y - 0.5) * 100.0;
    float bp = (jab.z - 0.5) * 100.0;

    float Cp = sqrt(ap * ap + bp * bp);
    bool isAchromatic = Cp < EPS_PRECISION;

    float hDeg = isAchromatic ? 0.0 : normalizeAngle360(atan(bp, ap) * RAD2DEG);
    float CpNormalized = isAchromatic ? 0.0 : Cp / 50.0;

    return vec3(
        clamp(jab.x, 0.0, 1.0),
        clamp(CpNormalized, 0.0, 1.0),
        clamp(hDeg / 360.0, 0.0, 1.0)
    );
}