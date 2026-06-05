vec3 igpgtg_lmsToLmsp(vec3 lms) {
    vec3 scale = vec3(18.36, 21.46, 19435.0);
    float gamma = 0.427;
    return vec3(
        pow_sign(lms.x / scale.x, gamma),
        pow_sign(lms.y / scale.y, gamma),
        pow_sign(lms.z / scale.z, gamma)
    );
}

vec3 igpgtg_lmspToLms(vec3 lmsp) {
    vec3 scale = vec3(18.36, 21.46, 19435.0);
    float inv_gamma = 1.0 / 0.427;
    return vec3(
        pow_sign(lmsp.x, inv_gamma) * scale.x,
        pow_sign(lmsp.y, inv_gamma) * scale.y,
        pow_sign(lmsp.z, inv_gamma) * scale.z
    );
}

vec3 igpgtg_to_xyz(vec3 igpgtg) {
    float IG = igpgtg.x;
    float PG = (igpgtg.y - 0.5) * 2.0;
    float TG = (igpgtg.z - 0.5) * 2.0;

    vec3 ipg = vec3(IG, PG, TG);

    mat3 LMSP_TO_IGPGTG = mat3(
        vec3(0.117, 8.285, -1.208),
        vec3(1.464, -8.361, 2.412),
        vec3(0.13, 21.4, -36.53)
    );
    mat3 IG_TO_LMSP = invert3x3(LMSP_TO_IGPGTG);

    vec3 lmsp = IG_TO_LMSP * ipg;
    vec3 lms = igpgtg_lmspToLms(lmsp);

    mat3 XYZ_TO_LMS = mat3(
        vec3(2.968, 1.237, -0.318),
        vec3(2.741, 5.969, 0.387),
        vec3(-0.649, -0.173, 2.311)
    );
    mat3 LMS_TO_XYZ = invert3x3(XYZ_TO_LMS);

    return LMS_TO_XYZ * lms;
}

vec3 xyz_to_igpgtg(vec3 xyz) {
    mat3 XYZ_TO_LMS = mat3(
        vec3(2.968, 1.237, -0.318),
        vec3(2.741, 5.969, 0.387),
        vec3(-0.649, -0.173, 2.311)
    );

    vec3 lms = XYZ_TO_LMS * xyz;
    vec3 lmsp = igpgtg_lmsToLmsp(lms);

    mat3 LMSP_TO_IGPGTG = mat3(
        vec3(0.117, 8.285, -1.208),
        vec3(1.464, -8.361, 2.412),
        vec3(0.13, 21.4, -36.53)
    );

    vec3 ipg = LMSP_TO_IGPGTG * lmsp;

    return vec3(
        clamp(ipg.x, 0.0, 1.0),
        clamp(ipg.y / 2.0 + 0.5, 0.0, 1.0),
        clamp(ipg.z / 2.0 + 0.5, 0.0, 1.0)
    );
}