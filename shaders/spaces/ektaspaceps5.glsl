const mat3 EKTA_TO_XYZ_MATRIX = mat3(
    vec3(0.593845, 0.260284, 0.010514),
    vec3(0.191405, 0.680112, 0.049793),
    vec3(0.165178, 0.059604, 1.028593)
);

const mat3 XYZ_TO_EKTA_MATRIX = mat3(
    vec3(2.001481, -0.763586, -0.003682),
    vec3(-0.491347, 1.701636, -0.081853),
    vec3(-0.292110, -0.021400, 0.978470)
);

vec3 ektaspaceps5_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return EKTA_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_ektaspaceps5(vec3 xyz) {
    vec3 v3 = XYZ_TO_EKTA_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.2), 0.0, 1.0)
    );
}