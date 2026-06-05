vec3 oklch_to_xyz(vec3 lch) {
    float L = lch.x;
    float C = lch.y * 0.4;
    float h = lch.z;

    float hueRadians = h * TAU;
    float a = C * cos(hueRadians);
    float b = C * sin(hueRadians);

    vec3 lab = vec3(L, a, b);
    vec3 lms_prime = OKLAB_TO_LMS_PRIME_MATRIX * lab;

    vec3 lms = lms_prime * lms_prime * lms_prime;

    return OKLAB_LMS_TO_XYZ_MATRIX * lms;
}

vec3 xyz_to_oklch(vec3 xyz) {
    vec3 lms = OKLAB_XYZ_TO_LMS_MATRIX * xyz;

    vec3 lms_prime = vec3(
        spow(lms.x, 1.0 / 3.0),
        spow(lms.y, 1.0 / 3.0),
        spow(lms.z, 1.0 / 3.0)
    );

    vec3 lab = LMS_PRIME_TO_OKLAB_MATRIX * lms_prime;

    float L = lab.x;
    float a = lab.y;
    float b = lab.z;

    float C = sqrt(a * a + b * b);

    float h = 0.0;

    if (C > EPS_PERCEPTUAL) {
        h = atan(b, a) / TAU;

        if (h < 0.0) {
            h += 1.0;
        }
    }

    bool skipClamp = (u_clamped == 0);

    return vec3(
        clamp_skip(L, 0.0, 1.0, skipClamp),
        clamp_skip(C / 0.4, 0.0, 1.0, skipClamp),
        h
    );
}