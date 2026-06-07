const mat3 MAX_TO_XYZ_MATRIX = mat3(
    vec3(0.573516, 0.207102, -0.000103),
    vec3(0.191710, 1.171120, -0.211771),
    vec3(0.185202, -0.378222, 1.300774)
);

const mat3 XYZ_TO_MAX_MATRIX = mat3(
    vec3(2.052678, -0.364467, 0.053919),
    vec3(-0.355106, 1.050604, 0.186641),
    vec3(-0.252084, 0.198947, 0.811801)
);

vec3 maxrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return MAX_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_maxrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_MAX_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.2), 0.0, 1.0)
    );
}