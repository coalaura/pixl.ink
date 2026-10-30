// Pre-calculated D50 to D65 Bradford adapted matrices for Adobe Wide Gamut RGB
const mat3 WIDE_TO_XYZ_D65_MATRIX = mat3(
	vec3(0.6781224824318064, 0.24041788604182066, 0.0035177688340690613),
	vec3(0.08302808520902638, 0.7304704537206989, 0.055264194852754654),
	vec3(0.1890041262145321, 0.029111660237480796, 1.0294771039854242)
);

const mat3 XYZ_D65_TO_WIDE_MATRIX = mat3(
	vec3(1.5303443648473918, -0.5045493844382352, 0.021855870028846456),
	vec3(-0.15301602972649428, 1.4223647073030499, -0.07583225019125589),
	vec3(-0.27663252316591647, 0.05240963323629428, 0.9694987379722069)
);

vec3 wideToLinear(vec3 v) {
    return sign(v) * pow(abs(v), vec3(2.2));
}

vec3 linearToWide(vec3 v) {
    return sign(v) * pow(abs(v), vec3(1.0 / 2.2));
}

vec3 adobewidegamut_to_xyz(vec3 rgb) {
    vec3 rLinear = wideToLinear(rgb);
    return WIDE_TO_XYZ_D65_MATRIX * rLinear;
}

vec3 xyz_to_adobewidegamut(vec3 xyz) {
    vec3 linearWide = XYZ_D65_TO_WIDE_MATRIX * xyz;
    vec3 rgb = linearToWide(linearWide);
    return clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);
}
