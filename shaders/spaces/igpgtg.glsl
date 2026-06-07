vec3 igpgtg_lmsToLmsp(vec3 lms) {
    vec3 scale = vec3(18.36, 21.46, 19435.0);
    float gamma = 0.427;
    return vec3(
        spow(lms.x / scale.x, gamma),
        spow(lms.y / scale.y, gamma),
        spow(lms.z / scale.z, gamma)
    );
}

vec3 igpgtg_lmspToLms(vec3 lmsp) {
    vec3 scale = vec3(18.36, 21.46, 19435.0);
    float inv_gamma = 1.0 / 0.427;
    return vec3(
        spow(lmsp.x, inv_gamma) * scale.x,
        spow(lmsp.y, inv_gamma) * scale.y,
        spow(lmsp.z, inv_gamma) * scale.z
    );
}

vec3 igpgtg_to_xyz(vec3 igpgtg) {
    float IG = igpgtg.x;
    float PG = (igpgtg.y - 0.5) * 2.0;
    float TG = (igpgtg.z - 0.5) * 2.0;

    vec3 ipg = vec3(IG, PG, TG);

    mat3 IG_TO_LMSP = mat3(
        vec3(0.58184646, 0.63454819, 0.0226570),
        vec3(0.12331855, -0.00943792, -0.00470115),
        vec3(0.07431308, -0.00327074, -0.03004816)
    );

    vec3 lmsp = IG_TO_LMSP * ipg;
    vec3 lms = igpgtg_lmspToLms(lmsp);

    mat3 LMS_TO_XYZ = mat3(
        vec3(0.43434872, -0.08785463, 0.07447971),
        vec3(-0.20636237, 0.20846349, -0.06330344),
        vec3(0.10652938, -0.00906685, 0.44889031)
    );

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