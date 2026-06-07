const float FLOG_A = 0.555556;
const float FLOG_B = 0.009468;
const float FLOG_C = 0.344676;
const float FLOG_D = 0.790453;
const float FLOG_E = 8.735631;
const float FLOG_F = 0.092864;
const float FLOG_CUT1 = 0.00089;
const float FLOG_CUT2 = 0.100537775223865;

float flogEncode(float lin) {
    if (lin >= FLOG_CUT1) {
        return FLOG_C * (log(FLOG_A * lin + FLOG_B) / log(10.0)) + FLOG_D;
    }
    return FLOG_E * lin + FLOG_F;
}

float flogDecode(float logVal) {
    if (logVal >= FLOG_CUT2) {
        return (pow(10.0, (logVal - FLOG_D) / FLOG_C) - FLOG_B) / FLOG_A;
    }
    return (logVal - FLOG_F) / FLOG_E;
}

vec3 fujifilmflog_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        flogDecode(rgb.r),
        flogDecode(rgb.g),
        flogDecode(rgb.b)
    );
    return REC2020_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_fujifilmflog(vec3 xyz) {
    vec3 v3 = XYZ_TO_REC2020_MATRIX * xyz;
    return vec3(
        clamp(flogEncode(v3.r), 0.0, 1.0),
        clamp(flogEncode(v3.g), 0.0, 1.0),
        clamp(flogEncode(v3.b), 0.0, 1.0)
    );
}