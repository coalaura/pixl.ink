const mat3 DCDM_TO_XYZ_MATRIX = mat3(
    vec3(1.024494, 0.025615, 0.006378),
    vec3(0.015161, 0.972611, -0.012255),
    vec3(0.019659, 0.004707, 1.147771)
);

const mat3 XYZ_TO_DCDM_MATRIX = mat3(
    vec3(0.976115, -0.025721, -0.005149),
    vec3(-0.015241, 1.028169, 0.011046),
    vec3(-0.016656, 0.000011, 0.871358)
);

vec3 dcdmxyz_to_xyz(vec3 rgb) {
    vec3 x_lin = vec3(
        spow(rgb.r, 2.6),
        spow(rgb.g, 2.6),
        spow(rgb.b, 2.6)
    );
    return DCDM_TO_XYZ_MATRIX * x_lin;
}

vec3 xyz_to_dcdmxyz(vec3 xyz) {
    vec3 v3 = XYZ_TO_DCDM_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.6), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.6), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.6), 0.0, 1.0)
    );
}