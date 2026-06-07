const mat3 NIKON_TO_XYZ_MATRIX = mat3(
    vec3(0.551670, 0.227653, -0.013589),
    vec3(0.221710, 1.038753, -0.211771),
    vec3(0.177048, -0.266406, 1.314260)
);

const mat3 XYZ_TO_NIKON_MATRIX = mat3(
    vec3(2.015401, -0.421601, 0.057037),
    vec3(-0.488118, 1.571408, -0.004944),
    vec3(-0.392407, -0.055611, 0.972322)
);

float linearToNLog(float v) {
    if (v >= 0.0031853) {
        return 0.270954 * (log(10.968434 * v + 0.043545) / log(10.0)) + 0.55376;
    }
    return 5.75 * v + 0.0929;
}

float nLogToLinear(float v) {
    if (v >= 0.111215) {
        return (pow(10.0, (v - 0.55376) / 0.270954) - 0.043545) / 10.968434;
    }
    return (v - 0.0929) / 5.75;
}

vec3 nikonngamut_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        nLogToLinear(rgb.r),
        nLogToLinear(rgb.g),
        nLogToLinear(rgb.b)
    );
    return NIKON_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_nikonngamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_NIKON_MATRIX * xyz;
    return vec3(
        clamp(linearToNLog(v3.r), 0.0, 1.0),
        clamp(linearToNLog(v3.g), 0.0, 1.0),
        clamp(linearToNLog(v3.b), 0.0, 1.0)
    );
}