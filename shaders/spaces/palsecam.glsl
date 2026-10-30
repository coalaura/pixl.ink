const mat3 PAL_TO_XYZ_MATRIX = mat3(
	vec3(0.4303201286631177, 0.22188381634192006, 0.02017125603108362),
	vec3(0.3416381894597987, 0.7068376333651007, 0.12958689945026847),
	vec3(0.17819637573244845, 0.07127855029297939, 0.9385009121908954)
);

const mat3 XYZ_TO_PAL_MATRIX = mat3(
	vec3(3.065024643488967, -0.9689928812362127, 0.06792043077995497),
	vec3(-1.394146853242949, 1.8754821660388807, -0.22899948519799002),
	vec3(-0.4760821333275545, 0.041544306611517805, 1.070025147205519)
);

vec3 palsecam_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return PAL_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_palsecam(vec3 xyz) {
    vec3 v3 = XYZ_TO_PAL_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0)
    );
}
