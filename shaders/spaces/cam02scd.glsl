const float CAM02_SCD_C1 = 0.007;
const float CAM02_SCD_C2 = 0.0363;

float cam02scd_jPrimeFromJ(float J) {
    return ((1.0 + 100.0 * CAM02_SCD_C1) * J) / (1.0 + CAM02_SCD_C1 * J);
}

float cam02scd_jFromJPrime(float Jp) {
    return Jp / (1.0 + CAM02_SCD_C1 * (100.0 - Jp));
}

float cam02scd_mPrimeFromM(float M) {
    return log(1.0 + CAM02_SCD_C2 * M) / CAM02_SCD_C2;
}

float cam02scd_mFromMPrime(float Mp) {
    return (exp(CAM02_SCD_C2 * Mp) - 1.0) / CAM02_SCD_C2;
}

vec3 cam02scd_to_xyz(vec3 scd) {
    float Jp = scd.x * 100.0;
    float ap = (scd.y - 0.5) * 60.0;
    float bp = (scd.z - 0.5) * 60.0;

    float Mp = length(vec2(ap, bp));

    float hDeg = 0.0;
    if (Mp > EPS_PRECISION) {
        hDeg = normalizeAngle360(atan(bp, ap) * RAD2DEG);
    }

    float J = cam02scd_jFromJPrime(Jp);
    float M = cam02scd_mFromMPrime(Mp);

    return cam02_to_xyz(vec3(J / 100.0, M / 120.0, hDeg / 360.0));
}

vec3 xyz_to_cam02scd(vec3 xyz) {
    vec3 jmh = xyz_to_cam02(xyz);

    float J = jmh.x * 100.0;
    float M = jmh.y * 120.0;
    float hDeg = jmh.z * 360.0;

    float Jp = cam02scd_jPrimeFromJ(J);
    float Mp = cam02scd_mPrimeFromM(M);

    float hRad = hDeg * DEG2RAD;
    float ap = Mp * cos(hRad);
    float bp = Mp * sin(hRad);

    return vec3(
        clamp(Jp / 100.0, 0.0, 1.0),
        clamp(ap / 60.0 + 0.5, 0.0, 1.0),
        clamp(bp / 60.0 + 0.5, 0.0, 1.0)
    );
}