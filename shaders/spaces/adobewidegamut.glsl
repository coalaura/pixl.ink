// Pre-calculated D50 to D65 Bradford adapted matrices for Adobe Wide Gamut RGB
const mat3 WIDE_TO_XYZ_D65_MATRIX = mat3(
    vec3(0.678273, 0.240496, 0.003526),
    vec3(0.083105, 0.730440, 0.055265),
    vec3(0.189108, 0.029152, 1.030191)
);

const mat3 XYZ_D65_TO_WIDE_MATRIX = mat3(
    vec3(1.530081, -0.504648, 0.021836),
    vec3(-0.153160, 1.422500, -0.075780),
    vec3(-0.276538, 0.052383, 0.968833)
);

vec3 wideToLinear(vec3 v) {
    return pow(max(vec3(0.0), v), vec3(2.2));
}

vec3 linearToWide(vec3 v) {
    return pow(max(vec3(0.0), v), vec3(1.0 / 2.2));
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