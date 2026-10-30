const mat3 EKTA_TO_XYZ_MATRIX = mat3(
	vec3(0.6121045353113123, 0.2686254308424259, 0.0021414501207582563),
	vec3(0.1671772770931183, 0.67871435886437, 0.012032718161129913),
	vec3(0.1708728814509344, 0.052660210293204446, 1.0740848993903596)
);

const mat3 XYZ_TO_EKTA_MATRIX = mat3(
	vec3(1.8304163183283326, -0.7247994337882656, 0.004470374797117035),
	vec3(-0.4460835448151876, 1.6512936538663943, -0.017609674512749925),
	vec3(-0.26932475957297086, 0.034346536924508876, 0.9311772876687595)
);

vec3 ektaspaceps5_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return EKTA_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_ektaspaceps5(vec3 xyz) {
    vec3 v3 = XYZ_TO_EKTA_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0)
    );
}
