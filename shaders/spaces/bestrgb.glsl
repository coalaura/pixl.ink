const mat3 BEST_TO_XYZ_MATRIX = mat3(
    vec3(0.632670, 0.228457, 0.000000),
    vec3(0.224422, 0.731454, 0.012111),
    vec3(0.093337, 0.040089, 1.076789)
);

const mat3 XYZ_TO_BEST_MATRIX = mat3(
    vec3(1.750381, -0.536481, 0.006037),
    vec3(-0.537210, 1.517361, -0.017056),
    vec3(-0.131649, -0.010411, 0.929210)
);

vec3 bestrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.0),
        spow(rgb.g, 2.0),
        spow(rgb.b, 2.0)
    );
    return BEST_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_bestrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_BEST_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.0), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.0), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.0), 0.0, 1.0)
    );
}