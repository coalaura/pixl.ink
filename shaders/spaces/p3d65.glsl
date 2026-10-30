const mat3 P3_TO_XYZ_MATRIX = mat3(
	vec3(0.48636197335842585, 0.22887622275690628, -3.9703695670930246e-17),
	vec3(0.2657290626656581, 0.6918983141105813, 0.04512380309416839),
	vec3(0.19806365783128083, 0.07922546313251233, 1.0431352645780791)
);

const mat3 XYZ_TO_P3_MATRIX = mat3(
	vec3(2.4945682934809112, -0.8292974010520652, 0.03587363394019175),
	vec3(-0.931783805787671, 1.7622569772356387, -0.0762314721229073),
	vec3(-0.4028838173099702, 0.023619229776799328, 0.957626728236782)
);

vec3 p3d65_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.6),
        spow(rgb.g, 2.6),
        spow(rgb.b, 2.6)
    );
    return P3_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_p3d65(vec3 xyz) {
    vec3 v3 = XYZ_TO_P3_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.6), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.6), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.6), 0.0, 1.0, u_clamped == 0)
    );
}
