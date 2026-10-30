const mat3 DCDM_TO_XYZ_MATRIX = mat3(
	vec3(1.0243752393855297, 0.025479884496986162, 0.006346811948731476),
	vec3(0.015086651431201418, 0.9727336606146708, -0.012196900562085874),
	vec3(0.019567336489029974, 0.0046859743050655725, 1.147066107159252)
);

const mat3 XYZ_TO_DCDM_MATRIX = mat3(
	vec3(0.9766895759129185, -0.025556163747305943, -0.005675846420659672),
	vec3(-0.015356127403867919, 1.0283797858269752, 0.011019860461214868),
	vec3(-0.016598219614323347, -0.0037651667762354586, 0.8718411399064762)
);

vec3 dcdmxyz_to_xyz(vec3 rgb) {
    vec3 x_lin = vec3(
        spow(rgb.r, 2.6),
        spow(rgb.g, 2.6),
        spow(rgb.b, 2.6)
    );
    return DCDM_TO_XYZ_MATRIX * x_lin;
}

vec3 xyz_to_dcdmxyz(vec3 xyz) {
    vec3 v3 = XYZ_TO_DCDM_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.6), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.6), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.6), 0.0, 1.0, u_clamped == 0)
    );
}
