vec3 oklrab_to_xyz(vec3 oklrab) {
    float Lr = oklrab.x;
    float a_r = (oklrab.y - 0.5) * 0.8;
    float b_r = (oklrab.z - 0.5) * 0.8;

    vec3 v3 = OKLAB_TO_LMS_PRIME_MATRIX * vec3(okToeInv(Lr), a_r, b_r);

    v3 = v3 * v3 * v3;

    return OKLAB_LMS_TO_XYZ_MATRIX * v3;
}

vec3 xyz_to_oklrab(vec3 xyz) {
    vec3 v3 = OKLAB_XYZ_TO_LMS_MATRIX * xyz;

    v3 = vec3(
        spow(v3.x, 1.0 / 3.0),
        spow(v3.y, 1.0 / 3.0),
        spow(v3.z, 1.0 / 3.0)
    );

    v3 = LMS_PRIME_TO_OKLAB_MATRIX * v3;

    return vec3(
        clamp(okToe(v3.x), 0.0, 1.0),
        clamp(v3.y / 0.8 + 0.5, 0.0, 1.0),
        clamp(v3.z / 0.8 + 0.5, 0.0, 1.0)
    );
}