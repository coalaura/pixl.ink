const mat3 ECIRGBV2_TO_XYZ_MATRIX = mat3(
    vec3(0.61385982, 0.30494147, 0.0014416),
    vec3(0.1607084, 0.60456662, 0.08012583),
    vec3(0.17594872, 0.09048829, 1.00733389)
);

const mat3 XYZ_TO_ECIRGBV2_MATRIX = mat3(
    vec3(1.85615974, -0.45587069, -0.28326063),
    vec3(-0.94711993, 1.90662031, -0.0201748),
    vec3(0.07267994, -0.15100486, 0.99358994)
);

vec3 ecirgbv2_to_xyz(vec3 rgb) {
    vec3 linear_eci = vec3(
        pow_sign(rgb.r, 2.2),
        pow_sign(rgb.g, 2.2),
        pow_sign(rgb.b, 2.2)
    );

    return ECIRGBV2_TO_XYZ_MATRIX * linear_eci;
}

vec3 xyz_to_ecirgbv2(vec3 xyz) {
    vec3 linear_eci = XYZ_TO_ECIRGBV2_MATRIX * xyz;

    vec3 rgb = vec3(
        pow_sign(linear_eci.r, 1.0 / 2.2),
        pow_sign(linear_eci.g, 1.0 / 2.2),
        pow_sign(linear_eci.b, 1.0 / 2.2)
    );

    return clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);
}