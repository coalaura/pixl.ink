const mat3 XTREME_TO_XYZ_MATRIX = mat3(
	vec3(0.8013967377549998, 0.284564822002765, 0.004142324556307548),
	vec3(0.0669082452358776, 0.776303131595839, 0.008615701882495115),
	vec3(0.08184971086448743, -0.06086795359860385, 1.075501041233445)
);

const mat3 XYZ_TO_XTREME_MATRIX = mat3(
	vec3(1.2873476700339033, -0.4719876823139346, -0.0011772249905104958),
	vec3(-0.10979800817363018, 1.3276038731820086, -0.010212375239817852),
	vec3(-0.10418605872530856, 0.11105576071054583, 0.9293108149822087)
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
        clamp_skip(spow(v3.r, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0)
    );
}
