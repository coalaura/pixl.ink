const mat3 BETA_TO_XYZ_MATRIX = mat3(
	vec3(0.6098275383163819, 0.27615471451687573, 0.001963423065102988),
	vec3(0.15038856455725927, 0.6512353096218321, 0.04457760544441758),
	vec3(0.18993859098172344, 0.07260997586129239, 1.0417180391627272)
);

const mat3 XYZ_TO_BETA_MATRIX = mat3(
	vec3(1.821874890281127, -0.7758805166958676, 0.029767924906909708),
	vec3(-0.39989172271582113, 1.7132063290112305, -0.0725584815718166),
	vec3(-0.3043128844406359, 0.022053743002214746, 0.959582491905032)
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
        clamp_skip(spow(v3.r, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0)
    );
}
