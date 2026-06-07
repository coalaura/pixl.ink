const mat3 P3_TO_XYZ_MATRIX = mat3(
    vec3(0.486571, 0.228973, 0.000000),
    vec3(0.265668, 0.691738, 0.044327),
    vec3(0.198189, 0.079289, 1.044573)
);

const mat3 XYZ_TO_P3_MATRIX = mat3(
    vec3(2.493497, -0.825120, 0.035011),
    vec3(-0.931384, 1.829438, -0.077553),
    vec3(-0.402711, 0.013511, 0.958210)
);

vec3 p3d65_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        srgbToLinear(rgb.r),
        srgbToLinear(rgb.g),
        srgbToLinear(rgb.b)
    );
    return P3_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_p3d65(vec3 xyz) {
    vec3 v3 = XYZ_TO_P3_MATRIX * xyz;
    return vec3(
        clamp(linearToSrgb(v3.r), 0.0, 1.0),
        clamp(linearToSrgb(v3.g), 0.0, 1.0),
        clamp(linearToSrgb(v3.b), 0.0, 1.0)
    );
}