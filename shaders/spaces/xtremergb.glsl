const mat3 XTREME_TO_XYZ_MATRIX = mat3(
    vec3(0.551989, 0.243763, -0.048704),
    vec3(0.245591, 0.726210, 0.038487),
    vec3(0.152848, 0.030027, 1.099117)
);

const mat3 XYZ_TO_XTREME_MATRIX = mat3(
    vec3(1.975471, -0.662589, 0.110757),
    vec3(-0.669866, 1.481249, -0.081518),
    vec3(-0.256177, -0.051413, 0.920786)
);

vec3 xtremergb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return XTREME_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_xtremergb(vec3 xyz) {
    vec3 v3 = XYZ_TO_XTREME_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.2), 0.0, 1.0)
    );
}