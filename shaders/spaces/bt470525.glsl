const mat3 BT470_525_TO_XYZ_MATRIX = mat3(
	vec3(0.5988119798654773, 0.2960139747134765, -0.0001390832680754654),
	vec3(0.16679694125900835, 0.5934896349903609, 0.06403331586774984),
	vec3(0.1845457727308794, 0.11049639029616307, 1.0243648350725734)
);

const mat3 XYZ_TO_BT470_525_MATRIX = mat3(
	vec3(1.9212963114142725, -0.9696153654144213, 0.060871776342576685),
	vec3(-0.5085427476615378, 1.9614349825038726, -0.1226788652571449),
	vec3(-0.2912780332662471, -0.03689414865796304, 0.9784814047261688)
);

vec3 bt470525_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return BT470_525_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_bt470525(vec3 xyz) {
    vec3 v3 = XYZ_TO_BT470_525_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0)
    );
}
