const mat3 RUSSELL_TO_XYZ_MATRIX = mat3(
	vec3(0.6780150023401549, 0.30494559361969503, 0.0012431736145884307),
	vec3(0.14363712337815862, 0.6660973163917943, 0.0445997409482601),
	vec3(0.12850256813705174, 0.02895708998851093, 1.0424161531093994)
);

const mat3 XYZ_TO_RUSSELL_MATRIX = mat3(
	vec3(1.627313653448227, -0.7463031817741873, 0.029989841471771413),
	vec3(-0.3381106729689196, 1.6591408081799912, -0.07058305817172719),
	vec3(-0.1912127722261321, 0.0459106333281605, 0.9575735231486185)
);

vec3 russellrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return RUSSELL_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_russellrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_RUSSELL_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0)
    );
}
