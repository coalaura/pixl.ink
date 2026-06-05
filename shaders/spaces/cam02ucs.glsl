float J_to_Jp(float J) {
    return (CAM_UCS_K * J) / (1.0 + CAM_UCS_C1 * J);
}

float M_to_Mp(float M) {
    return log(1.0 + CAM_UCS_C2 * M) / CAM_UCS_C2;
}

float Jp_to_J(float Jp) {
    return Jp / (CAM_UCS_K - CAM_UCS_C1 * Jp);
}

float Mp_to_M(float Mp) {
    return (exp(CAM_UCS_C2 * Mp) - 1.0) / CAM_UCS_C2;
}

vec3 cam02ucs_to_xyz(vec3 jab) {
    float Jp = jab.x * 100.0;
    float ap = (jab.y - 0.5) * 100.0;
    float bp = (jab.z - 0.5) * 100.0;

    float Mp = sqrt(ap * ap + bp * bp);

    if (Jp < EPS_PRECISION && Mp < EPS_PRECISION) {
        return vec3(0.0);
    }

    float h = normalizeAngle360(atan(bp, ap) * RAD2DEG);

    float J = Jp_to_J(Jp);
    float M = Mp_to_M(Mp);

    return cam02_to_xyz(vec3(J / 100.0, M / 120.0, h / 360.0));
}

vec3 xyz_to_cam02ucs(vec3 xyz) {
    vec3 jmh = xyz_to_cam02(xyz);

    float J = jmh.x * 100.0;
    float M = jmh.y * 120.0;
    float hDeg = jmh.z * 360.0;

    float Jp = J_to_Jp(J);
    float Mp = M_to_Mp(M);

    bool ach = Mp < EPS_PRECISION;

    float aPrime = ach ? 0.0 : Mp * cos(hDeg * DEG2RAD);
    float bPrime = ach ? 0.0 : Mp * sin(hDeg * DEG2RAD);

    return vec3(
        clamp_skip(Jp / 100.0, 0.0, 1.0, u_clamped == 0),
        clamp_skip(aPrime / 100.0 + 0.5, 0.0, 1.0, u_clamped == 0),
        clamp_skip(bPrime / 100.0 + 0.5, 0.0, 1.0, u_clamped == 0)
    );
}