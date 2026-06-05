const mat3 CANON_CG_TO_XYZ_MATRIX = mat3(
    vec3(0.71603456, 0.26125585, -0.00967614),
    vec3(0.12968143, 0.86962843, -0.23647791),
    vec3(0.10470993, -0.13088741, 1.33505158)
);

const mat3 XYZ_TO_CANON_CG_MATRIX = mat3(
    vec3(1.48985031, -0.45817398, -0.07035839),
    vec3(-0.26089851, 1.26164791, 0.22158499),
    vec3(-0.14242959, 0.15962619, 0.77627740)
);

vec3 canoncinemagamut_to_xyz(vec3 rgb) {
    return CANON_CG_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_canoncinemagamut(vec3 xyz) {
    vec3 rgb = XYZ_TO_CANON_CG_MATRIX * xyz;
    return clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);
}