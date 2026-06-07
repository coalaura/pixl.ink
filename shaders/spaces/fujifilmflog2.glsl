const float FLOG2_A = 5.555556;
const float FLOG2_B = 0.064829;
const float FLOG2_C = 0.245281;
const float FLOG2_D = 0.384316;
const float FLOG2_E = 8.799461;
const float FLOG2_F = 0.092864;
const float FLOG2_CUT1 = 0.000889;
const float FLOG2_CUT2 = 0.100686685370811;

float flog2Encode(float lin) {
    if (lin >= FLOG2_CUT1) {
        return FLOG2_C * (log(FLOG2_A * lin + FLOG2_B) / log(10.0)) + FLOG2_D;
    }
    return FLOG2_E * lin + FLOG2_F;
}

float flog2Decode(float logVal) {
    if (logVal >= FLOG2_CUT2) {
        return (pow(10.0, (logVal - FLOG2_D) / FLOG2_C) - FLOG2_B) / FLOG2_A;
    }
    return (logVal - FLOG2_F) / FLOG2_E;
}

vec3 fujifilmflog2_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        flog2Decode(rgb.r),
        flog2Decode(rgb.g),
        flog2Decode(rgb.b)
    );
    return REC2020_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_fujifilmflog2(vec3 xyz) {
    vec3 v3 = XYZ_TO_REC2020_MATRIX * xyz;
    return vec3(
        clamp(flog2Encode(v3.r), 0.0, 1.0),
        clamp(flog2Encode(v3.g), 0.0, 1.0),
        clamp(flog2Encode(v3.b), 0.0, 1.0)
    );
}