const mat3 PLASA_TO_XYZ_MATRIX = mat3(
    vec3(0.797713, 0.288071, 0.000000),
    vec3(0.135186, 0.711843, 0.000000),
    vec3(0.017530, 0.000086, 1.088900)
);

const mat3 XYZ_TO_PLASA_MATRIX = mat3(
    vec3(1.345943, -0.544599, 0.000000),
    vec3(-0.255608, 1.508167, 0.000000),
    vec3(-0.021669, 0.000043, 0.918358)
);

vec3 plasaansie154_to_xyz(vec3 rgb) {
    return PLASA_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_plasaansie154(vec3 xyz) {
    vec3 v3 = XYZ_TO_PLASA_MATRIX * xyz;
    return clamp(v3, 0.0, 1.0);
}