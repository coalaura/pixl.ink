const mat3 DON_TO_XYZ_MATRIX = mat3(
    vec3(0.655845, 0.295284, 0.012514),
    vec3(0.182405, 0.617112, 0.063793),
    vec3(0.112178, 0.087604, 1.012593)
);

const mat3 XYZ_TO_DON_MATRIX = mat3(
    vec3(1.884481, -0.903586, 0.033682),
    vec3(-0.551347, 1.961636, -0.123853),
    vec3(-0.161110, -0.073400, 0.991470)
);

vec3 donrgb4_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 1.8),
        spow(rgb.g, 1.8),
        spow(rgb.b, 1.8)
    );
    return DON_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_donrgb4(vec3 xyz) {
    vec3 v3 = XYZ_TO_DON_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 1.8), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 1.8), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 1.8), 0.0, 1.0)
    );
}