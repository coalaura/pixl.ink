const mat3 GOPRO_TO_XYZ_MATRIX = mat3(
    vec3(0.551989, 0.243763, -0.048704),
    vec3(0.245591, 0.726210, 0.038487),
    vec3(0.152848, 0.030027, 1.099117)
);

const mat3 XYZ_TO_GOPRO_MATRIX = mat3(
    vec3(1.975471, -0.662589, 0.110757),
    vec3(-0.669866, 1.481249, -0.081518),
    vec3(-0.256177, -0.051413, 0.920786)
);

float linearToProtune(float v) {
    float s = v < 0.0 ? -1.0 : (v > 0.0 ? 1.0 : 0.0);
    return s * (log(abs(v) * 112.0 + 1.0) / log(113.0));
}

float protuneToLinear(float v) {
    float s = v < 0.0 ? -1.0 : (v > 0.0 ? 1.0 : 0.0);
    return s * ((pow(113.0, abs(v)) - 1.0) / 112.0);
}

vec3 goproprotunenative_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        protuneToLinear(rgb.r),
        protuneToLinear(rgb.g),
        protuneToLinear(rgb.b)
    );
    return GOPRO_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_goproprotunenative(vec3 xyz) {
    vec3 v3 = XYZ_TO_GOPRO_MATRIX * xyz;
    return vec3(
        clamp(linearToProtune(v3.r), 0.0, 1.0),
        clamp(linearToProtune(v3.g), 0.0, 1.0),
        clamp(linearToProtune(v3.b), 0.0, 1.0)
    );
}