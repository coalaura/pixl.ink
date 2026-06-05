const mat3 VGAMUT_TO_XYZ_MAT = mat3(
    vec3(0.606192, 0.231162, -0.008218),
    vec3(0.181034, 0.772023, -0.005479),
    vec3(0.163202, -0.003185, 1.102597)
);

const mat3 XYZ_TO_VGAMUT_MAT = mat3(
    vec3(1.808421, -0.541439, 0.010786),
    vec3(-0.425970, 1.422848, 0.003894),
    vec3(-0.268907, 0.084252, 0.905357)
);

vec3 vgamut_to_xyz(vec3 rgb) {
    return VGAMUT_TO_XYZ_MAT * rgb;
}

vec3 xyz_to_vgamut(vec3 xyz) {
    vec3 rgb = XYZ_TO_VGAMUT_MAT * xyz;
    return clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);
}