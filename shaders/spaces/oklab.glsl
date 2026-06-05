vec3 oklab_to_xyz(vec3 oklab) {
    float L = oklab.x;
    float a = (oklab.y - 0.5) * 0.8;
    float b = (oklab.z - 0.5) * 0.8;

    vec3 lms = OKLAB_TO_LMS_PRIME_MATRIX * vec3(L, a, b);

    lms = lms * lms * lms;

    return OKLAB_LMS_TO_XYZ_MATRIX * lms;
}

vec3 xyz_to_oklab(vec3 xyz) {
    vec3 lms = OKLAB_XYZ_TO_LMS_MATRIX * xyz;

    lms = vec3(
        spow(lms.x, 1.0 / 3.0),
        spow(lms.y, 1.0 / 3.0),
        spow(lms.z, 1.0 / 3.0)
    );

    vec3 lab = LMS_PRIME_TO_OKLAB_MATRIX * lms;

    return vec3(
        clamp(lab.x, 0.0, 1.0),
        clamp(lab.y / 0.8 + 0.5, 0.0, 1.0),
        clamp(lab.z / 0.8 + 0.5, 0.0, 1.0)
    );
}