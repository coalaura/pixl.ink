const mat3 SGAMUT3_TO_XYZ_MATRIX = mat3(
    vec3(0.70647185, 0.27097587, -0.00967759),
    vec3(0.12880016, 0.78660142, 0.00460049),
    vec3(0.11515511, -0.05757751, 1.09397341)
);

const mat3 XYZ_TO_SGAMUT3_MATRIX = mat3(
    vec3(1.5074241, -0.24582638, -0.17161399),
    vec3(-0.51815725, 1.35540131, 0.12587943),
    vec3(0.01551412, -0.00787532, 0.91205207)
);

vec3 sgamut3_to_xyz(vec3 rgb) {
    return SGAMUT3_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_sgamut3(vec3 xyz) {
    vec3 rgb = XYZ_TO_SGAMUT3_MATRIX * xyz;
    return clamp(rgb, 0.0, 1.0);
}