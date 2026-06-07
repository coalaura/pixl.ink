const mat3 COLORMATCH_TO_XYZ_MATRIX = mat3(
    vec3(0.504207, 0.253689, 0.013589),
    vec3(0.301540, 0.686523, 0.114771),
    vec3(0.144681, 0.059788, 0.960540)
);

const mat3 XYZ_TO_COLORMATCH_MATRIX = mat3(
    vec3(2.628867, -0.957597, 0.077227),
    vec3(-1.089851, 1.942718, -0.216668),
    vec3(-0.265538, 0.024887, 1.074457)
);

vec3 colormatchrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 1.8),
        spow(rgb.g, 1.8),
        spow(rgb.b, 1.8)
    );
    return COLORMATCH_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_colormatchrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_COLORMATCH_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 1.8), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 1.8), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 1.8), 0.0, 1.0)
    );
}