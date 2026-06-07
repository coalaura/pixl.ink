const mat3 ERIMM_TO_XYZ_MATRIX = mat3(
    vec3(0.797713, 0.288071, 0.000000),
    vec3(0.135186, 0.711843, 0.000000),
    vec3(0.017530, 0.000086, 1.088900)
);

const mat3 XYZ_TO_ERIMM_MATRIX = mat3(
    vec3(1.345943, -0.544599, 0.000000),
    vec3(-0.255608, 1.508167, 0.000000),
    vec3(-0.021669, 0.000043, 0.918358)
);

float linearToERIMM(float v) {
    if (v >= 0.001) {
        return 0.3524 * (log(v) / log(10.0)) + 1.0;
    }
    return 117.47 * v;
}

float erimmToLinear(float v) {
    if (v >= 0.11747) {
        return pow(10.0, (v - 1.0) / 0.3524);
    }
    return v / 117.47;
}

vec3 erimmrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        erimmToLinear(rgb.r),
        erimmToLinear(rgb.g),
        erimmToLinear(rgb.b)
    );
    return ERIMM_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_erimmrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_ERIMM_MATRIX * xyz;
    return vec3(
        clamp(linearToERIMM(v3.r), 0.0, 1.0),
        clamp(linearToERIMM(v3.g), 0.0, 1.0),
        clamp(linearToERIMM(v3.b), 0.0, 1.0)
    );
}