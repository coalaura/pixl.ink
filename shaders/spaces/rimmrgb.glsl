const mat3 RIMM_TO_XYZ_MATRIX = mat3(
    vec3(0.797713, 0.288071, 0.000000),
    vec3(0.135186, 0.711843, 0.000000),
    vec3(0.017530, 0.000086, 1.088900)
);

const mat3 XYZ_TO_RIMM_MATRIX = mat3(
    vec3(1.345943, -0.544599, 0.000000),
    vec3(-0.255608, 1.508167, 0.000000),
    vec3(-0.021669, 0.000043, 0.918358)
);

vec3 rimmrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        rec709ToLinear(rgb.r),
        rec709ToLinear(rgb.g),
        rec709ToLinear(rgb.b)
    );
    return RIMM_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_rimmrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_RIMM_MATRIX * xyz;
    return vec3(
        clamp(linearToRec709(v3.r), 0.0, 1.0),
        clamp(linearToRec709(v3.g), 0.0, 1.0),
        clamp(linearToRec709(v3.b), 0.0, 1.0)
    );
}