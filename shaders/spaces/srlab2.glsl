vec3 srlab2_to_xyz(vec3 lab) {
    float L = lab.x * 100.0;
    float a = (lab.y - 0.5) * 200.0;
    float b = (lab.z - 0.5) * 200.0;

    mat3 LMS_PRIME_TO_LAB = mat3(
        vec3(37.095, 663.4684, 63.9569),
        vec3(62.9054, -750.5078, 108.4576),
        vec3(-0.0008, 87.0328, -172.4152)
    );
    mat3 LAB_TO_LMS_PRIME = invert3x3(LMS_PRIME_TO_LAB);

    vec3 v3 = LAB_TO_LMS_PRIME * vec3(L, a, b);

    v3.x = fLabInv((v3.x + 0.16) / 1.16);
    v3.y = fLabInv((v3.y + 0.16) / 1.16);
    v3.z = fLabInv((v3.z + 0.16) / 1.16);

    mat3 RGB_TO_LMS = mat3(
        vec3(0.32053, 0.161987, 0.017228),
        vec3(0.63692, 0.756636, 0.10866),
        vec3(0.04256, 0.081376, 0.874112)
    );
    mat3 LMS_TO_RGB = invert3x3(RGB_TO_LMS);

    v3 = LMS_TO_RGB * v3;
    v3 = LINEAR_RGB_TO_XYZ_MATRIX * v3;

    return v3;
}

vec3 xyz_to_srlab2(vec3 xyz) {
    vec3 v3 = XYZ_TO_LINEAR_RGB_MATRIX * xyz;

    mat3 RGB_TO_LMS = mat3(
        vec3(0.32053, 0.161987, 0.017228),
        vec3(0.63692, 0.756636, 0.10866),
        vec3(0.04256, 0.081376, 0.874112)
    );

    v3 = RGB_TO_LMS * v3;

    v3.x = 1.16 * fLab(v3.x) - 0.16;
    v3.y = 1.16 * fLab(v3.y) - 0.16;
    v3.z = 1.16 * fLab(v3.z) - 0.16;

    mat3 LMS_PRIME_TO_LAB = mat3(
        vec3(37.095, 663.4684, 63.9569),
        vec3(62.9054, -750.5078, 108.4576),
        vec3(-0.0008, 87.0328, -172.4152)
    );

    v3 = LMS_PRIME_TO_LAB * v3;

    return vec3(
        clamp(v3.x / 100.0, 0.0, 1.0),
        clamp(v3.y / 200.0 + 0.5, 0.0, 1.0),
        clamp(v3.z / 200.0 + 0.5, 0.0, 1.0)
    );
}