float cieRgbToLinear(float v) {
    return pow_sign(v, 2.2);
}

vec3 cieRgbToLinear(vec3 v) {
    return vec3(cieRgbToLinear(v.r), cieRgbToLinear(v.g), cieRgbToLinear(v.b));
}

float linearToCieRgb(float v) {
    return pow_sign(v, 1.0 / 2.2);
}

vec3 linearToCieRgb(vec3 v) {
    return vec3(linearToCieRgb(v.r), linearToCieRgb(v.g), linearToCieRgb(v.b));
}

vec3 ciergb_to_xyz(vec3 rgb) {
    mat3 CIERGB_TO_XYZ_MATRIX = mat3(
        vec3(0.4623328, 0.1633212, 0.0007411),
        vec3(0.2740953, 0.8240755, 0.0092348),
        vec3(0.2139999, 0.0126007, 1.0789233)
    );

    vec3 rgbLin = cieRgbToLinear(rgb);
    return CIERGB_TO_XYZ_MATRIX * rgbLin;
}

vec3 xyz_to_ciergb(vec3 xyz) {
    mat3 XYZ_TO_CIERGB_MATRIX = mat3(
        vec3(2.4496570, -0.4855286, 0.0024731),
        vec3(-0.8094991, 1.3740790, -0.0112051),
        vec3(-0.4764258, 0.0802547, 0.9264953)
    );

    vec3 v3 = XYZ_TO_CIERGB_MATRIX * xyz;
    return linearToCieRgb(v3);
}