float cam16ucs_jPrimeFromJ(float J) {
    return ((1.0 + 100.0 * CAM_UCS_C1) * J) / (1.0 + CAM_UCS_C1 * J);
}

float cam16ucs_jFromJPrime(float Jp) {
    return Jp / (1.0 + CAM_UCS_C1 * (100.0 - Jp));
}

float cam16ucs_mPrimeFromM(float M) {
    return log(1.0 + CAM_UCS_C2 * M) / CAM_UCS_C2;
}

float cam16ucs_mFromMPrime(float Mp) {
    return (exp(CAM_UCS_C2 * Mp) - 1.0) / CAM_UCS_C2;
}

vec3 cam16ucs_to_xyz(vec3 ucs) {
    float Jp = ucs.x * 100.0;
    float ap = (ucs.y - 0.5) * 100.0;
    float bp = (ucs.z - 0.5) * 100.0;

    float Mp = length(vec2(ap, bp));

    float hDeg = 0.0;
    if (Mp > EPS_PRECISION) {
        hDeg = normalizeAngle360(atan(bp, ap) * RAD2DEG);
    }

    float J = cam16ucs_jFromJPrime(Jp);
    float M = cam16ucs_mFromMPrime(Mp);

    return cam16_to_xyz(vec3(J / 100.0, M / 105.0, hDeg / 360.0));
}

vec3 xyz_to_cam16ucs(vec3 xyz) {
    vec3 jmh = xyz_to_cam16(xyz);

    float J = jmh.x * 100.0;
    float M = jmh.y * 105.0;
    float hDeg = jmh.z * 360.0;

    float Jp = cam16ucs_jPrimeFromJ(J);
    float Mp = cam16ucs_mPrimeFromM(M);

    float hRad = hDeg * DEG2RAD;
    float ap = Mp * cos(hRad);
    float bp = Mp * sin(hRad);

    return vec3(
        clamp(Jp / 100.0, 0.0, 1.0),
        clamp(ap / 100.0 + 0.5, 0.0, 1.0),
        clamp(bp / 100.0 + 0.5, 0.0, 1.0)
    );
}