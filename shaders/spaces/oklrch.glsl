vec3 oklrch_to_xyz(vec3 oklrch) {
    float Lr = oklrch.x;
    float Cr = oklrch.y * 0.4;
    float hDeg = oklrch.z * 360.0;

    float a_r = 0.0;
    float b_r = 0.0;

    if (Cr > EPS_PERCEPTUAL) {
        float hRad = hDeg * DEG2RAD;
        a_r = Cr * cos(hRad);
        b_r = Cr * sin(hRad);
    }

    vec3 v3 = OKLAB_TO_LMS_PRIME_MATRIX * vec3(okToeInv(Lr), a_r, b_r);

    v3 = v3 * v3 * v3;

    return OKLAB_LMS_TO_XYZ_MATRIX * v3;
}

vec3 xyz_to_oklrch(vec3 xyz) {
    vec3 v3 = OKLAB_XYZ_TO_LMS_MATRIX * xyz;

    v3 = vec3(
        spow(v3.x, 1.0 / 3.0),
        spow(v3.y, 1.0 / 3.0),
        spow(v3.z, 1.0 / 3.0)
    );

    v3 = LMS_PRIME_TO_OKLAB_MATRIX * v3;

    float Lr = okToe(v3.x);
    float a_r = v3.y;
    float b_r = v3.z;

    float Cr = length(vec2(a_r, b_r));

    float hNorm = 0.0;

    if (Cr > EPS_PERCEPTUAL) {
        float hDeg = normalizeAngle360(atan(b_r, a_r) * RAD2DEG);
        hNorm = hDeg / 360.0;
    }

    return vec3(
        clamp(Lr, 0.0, 1.0),
        clamp(Cr / 0.4, 0.0, 1.0),
        clamp(hNorm, 0.0, 1.0)
    );
}