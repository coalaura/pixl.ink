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

    const mat3 IG_TO_LMSP = mat3(
	vec3(0.5818464618992462, 0.634548193791416, 0.022656986516578322),
	vec3(0.12331854793907825, -0.009437923746683556, -0.004701151874826368),
	vec3(0.07431308420320766, -0.003270744675229784, -0.030048158824914566)
);

    vec3 lmsp = IG_TO_LMSP * ipg;
    vec3 lms = igpgtg_lmspToLms(lmsp);

    const mat3 LMS_TO_XYZ = mat3(
	vec3(0.4343486855574635, -0.08785463778363385, 0.07447971736457798),
	vec3(-0.20636237011428427, 0.2084634664799235, -0.06330532030466153),
	vec3(0.10653033617352775, -0.00906684561685487, 0.4488903142176135)
);

    return LMS_TO_XYZ * lms;
}

vec3 xyz_to_igpgtg(vec3 xyz) {
    const mat3 XYZ_TO_LMS = mat3(
	vec3(2.968, 1.237, -0.318),
	vec3(2.741, 5.969, 0.387),
	vec3(-0.649, -0.173, 2.311)
);

    vec3 lms = XYZ_TO_LMS * xyz;
    vec3 lmsp = igpgtg_lmsToLmsp(lms);

    const mat3 LMSP_TO_IGPGTG = mat3(
	vec3(0.117, 8.285, -1.208),
	vec3(1.464, -8.361, 2.412),
	vec3(0.13, 21.4, -36.53)
);

    vec3 ipg = LMSP_TO_IGPGTG * lmsp;

    return vec3(
        clamp_skip(ipg.x, 0.0, 1.0, u_clamped == 0),
        clamp_skip(ipg.y / 2.0 + 0.5, 0.0, 1.0, u_clamped == 0),
        clamp_skip(ipg.z / 2.0 + 0.5, 0.0, 1.0, u_clamped == 0)
    );
}
