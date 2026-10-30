const mat3 NTSC_TO_XYZ_MATRIX = mat3(
	vec3(0.5988119798654773, 0.2960139747134765, -0.0001390832680754654),
	vec3(0.16679694125900835, 0.5934896349903609, 0.06403331586774984),
	vec3(0.1845457727308794, 0.11049639029616307, 1.0243648350725734)
);

const mat3 XYZ_TO_NTSC_MATRIX = mat3(
	vec3(1.9212963114142725, -0.9696153654144213, 0.060871776342576685),
	vec3(-0.5085427476615378, 1.9614349825038726, -0.1226788652571449),
	vec3(-0.2912780332662471, -0.03689414865796304, 0.9784814047261688)
);

vec3 ntsc_to_linear(vec3 rgb) {
    const float NTSC_GAMMA = 2.2;
    return vec3(
        spow(rgb.r, NTSC_GAMMA),
        spow(rgb.g, NTSC_GAMMA),
        spow(rgb.b, NTSC_GAMMA)
    );
}

vec3 linear_to_ntsc(vec3 rgb) {
    const float NTSC_GAMMA = 2.2;
    return vec3(
        spow(rgb.r, 1.0 / NTSC_GAMMA),
        spow(rgb.g, 1.0 / NTSC_GAMMA),
        spow(rgb.b, 1.0 / NTSC_GAMMA)
    );
}

vec3 ntsc_to_xyz(vec3 rgb) {
    return NTSC_TO_XYZ_MATRIX * ntsc_to_linear(rgb);
}

vec3 xyz_to_ntsc(vec3 xyz) {
    return linear_to_ntsc(XYZ_TO_NTSC_MATRIX * xyz);
}