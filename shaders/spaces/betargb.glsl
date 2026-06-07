const mat3 BETA_TO_XYZ_MATRIX = mat3(
    vec3(0.531649, 0.245842, 0.012574),
    vec3(0.183478, 0.693452, 0.041695),
    vec3(0.235302, 0.060706, 1.034631)
);

const mat3 XYZ_TO_BETA_MATRIX = mat3(
    vec3(2.055811, -0.728080, -0.004944),
    vec3(-0.516801, 1.571408, -0.057037),
    vec3(-0.441775, -0.055611, 0.972322)
);

vec3 betargb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return BETA_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_betargb(vec3 xyz) {
    vec3 v3 = XYZ_TO_BETA_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.2), 0.0, 1.0)
    );
}