const mat3 DON_TO_XYZ_MATRIX = mat3(
	vec3(0.5938811687924727, 0.267313962542885, 0.0019443764156188217),
	vec3(0.17040709057511624, 0.6420161001680772, 0.08503315363485263),
	vec3(0.18586643448777568, 0.09066993728903787, 1.0012815376217763)
);

const mat3 XYZ_TO_DON_MATRIX = mat3(
	vec3(1.8924984611198596, -0.7970129006199651, 0.06401075885730656),
	vec3(-0.46132031078450403, 1.7707831812489083, -0.14948672511063074),
	vec3(-0.30952738660205953, -0.012402959058673604, 1.00037448293791)
);

vec3 donrgb4_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 1.8),
        spow(rgb.g, 1.8),
        spow(rgb.b, 1.8)
    );
    return DON_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_donrgb4(vec3 xyz) {
    vec3 v3 = XYZ_TO_DON_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 1.8), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 1.8), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 1.8), 0.0, 1.0, u_clamped == 0)
    );
}
