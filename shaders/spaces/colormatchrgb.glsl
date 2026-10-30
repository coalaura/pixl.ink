const mat3 COLORMATCH_TO_XYZ_MATRIX = mat3(
	vec3(0.4818857348997564, 0.2637312139530475, 0.03288581018741313),
	vec3(0.2981720178226619, 0.6578960476490723, 0.135092334850128),
	vec3(0.1700969411329467, 0.0783727383978806, 0.9202809226347066)
);

const mat3 XYZ_TO_COLORMATCH_MATRIX = mat3(
	vec3(2.7358066613883563, -1.1043707165132575, 0.06435295853841637),
	vec3(-1.1563115000841482, 2.0138219046632604, -0.25429807008712146),
	vec3(-0.40718984465951663, 0.03262193391520186, 1.096386733556452)
);

vec3 colormatchrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 1.8),
        spow(rgb.g, 1.8),
        spow(rgb.b, 1.8)
    );
    return COLORMATCH_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_colormatchrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_COLORMATCH_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 1.8), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 1.8), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 1.8), 0.0, 1.0, u_clamped == 0)
    );
}
