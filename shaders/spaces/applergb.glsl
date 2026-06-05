const mat3 APPLE_RGB_TO_XYZ_MATRIX = mat3(
    vec3(0.4496592073, 0.2446145595, 0.0251809122),
    vec3(0.3162981325, 0.6721335316, 0.1412045265),
    vec3(0.1845105743, 0.0833254209, 0.9225325515)
);

const mat3 XYZ_TO_APPLE_RGB_MATRIX = mat3(
    vec3(2.951965155, -1.084928395, 0.085486041),
    vec3(-1.289595594, 1.990524584, -0.269473315),
    vec3(-0.473926533, 0.037201383, 1.091204193)
);

vec3 applergb_to_xyz(vec3 rgb) {
    vec3 rglLin = vec3(
        pow_sign(rgb.r, 1.8),
        pow_sign(rgb.g, 1.8),
        pow_sign(rgb.b, 1.8)
    );

    return APPLE_RGB_TO_XYZ_MATRIX * rglLin;
}

vec3 xyz_to_applergb(vec3 xyz) {
    vec3 v3 = XYZ_TO_APPLE_RGB_MATRIX * xyz;

    return vec3(
        pow_sign(v3.r, 1.0 / 1.8),
        pow_sign(v3.g, 1.0 / 1.8),
        pow_sign(v3.b, 1.0 / 1.8)
    );
}