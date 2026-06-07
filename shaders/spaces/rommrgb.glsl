const mat3 ROMM_TO_XYZ_MATRIX = mat3(
    vec3(0.797713, 0.288071, 0.000000),
    vec3(0.135186, 0.711843, 0.000000),
    vec3(0.017530, 0.000086, 1.088900)
);

const mat3 XYZ_TO_ROMM_MATRIX = mat3(
    vec3(1.345943, -0.544599, 0.000000),
    vec3(-0.255608, 1.508167, 0.000000),
    vec3(-0.021669, 0.000043, 0.918358)
);

vec3 rommrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        prophotoToLinear(rgb.r),
        prophotoToLinear(rgb.g),
        prophotoToLinear(rgb.b)
    );
    return ROMM_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_rommrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_ROMM_MATRIX * xyz;
    return vec3(
        clamp(linearToProphoto(v3.r), 0.0, 1.0),
        clamp(linearToProphoto(v3.g), 0.0, 1.0),
        clamp(linearToProphoto(v3.b), 0.0, 1.0)
    );
}