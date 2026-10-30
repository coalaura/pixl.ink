const mat3 NTSC1987_TO_XYZ_MATRIX = mat3(
	vec3(0.3932762932546391, 0.2122443487405989, 0.018727442535935175),
	vec3(0.3653654413325555, 0.7012659277189371, 0.11196682879546052),
	vec3(0.1915129592681703, 0.08648972354046403, 0.9575647963408516)
);

const mat3 XYZ_TO_NTSC1987_MATRIX = mat3(
	vec3(3.508183950353893, -1.068733414434887, 0.056354805557270876),
	vec3(-1.7408728431785285, 1.9771977016859654, -0.19714431978685396),
	vec3(-0.5443966622998146, 0.03516108402501921, 1.0508513742149914)
);

vec3 ntsc1987_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        rec709ToLinear(rgb.r),
        rec709ToLinear(rgb.g),
        rec709ToLinear(rgb.b)
    );
    return NTSC1987_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_ntsc1987(vec3 xyz) {
    vec3 v3 = XYZ_TO_NTSC1987_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToRec709(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToRec709(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToRec709(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
