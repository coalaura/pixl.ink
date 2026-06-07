const mat3 FUJI_TO_XYZ_MATRIX = mat3(
    vec3(0.551670, 0.227653, -0.013589),
    vec3(0.221710, 1.038753, -0.211771),
    vec3(0.177048, -0.266406, 1.314260)
);

const mat3 XYZ_TO_FUJI_MATRIX = mat3(
    vec3(2.015401, -0.421601, 0.057037),
    vec3(-0.488118, 1.571408, -0.004944),
    vec3(-0.392407, -0.055611, 0.972322)
);

const float FGAMUT_FLOG_A = 0.555556;
const float FGAMUT_FLOG_B = 0.009468;
const float FGAMUT_FLOG_C = 0.344676;
const float FGAMUT_FLOG_D = 0.790453;
const float FGAMUT_FLOG_CUT1 = 0.00089;
const float FGAMUT_FLOG_LOG_CUT = 0.100537775223865;
const float FGAMUT_FLOG_F = 0.092864;
const float FGAMUT_FLOG_E = 8.62221935099663;

float linearToFLog(float v) {
    float val = abs(v);
    float logVal = val >= FGAMUT_FLOG_CUT1 ? FGAMUT_FLOG_C * (log(FGAMUT_FLOG_A * val + FGAMUT_FLOG_B) / log(10.0)) + FGAMUT_FLOG_D : FGAMUT_FLOG_E * val + FGAMUT_FLOG_F;
    return v >= 0.0 ? logVal : FGAMUT_FLOG_F * 2.0 - logVal;
}

float fLogToLinear(float v) {
    float val = v >= FGAMUT_FLOG_F ? v : FGAMUT_FLOG_F * 2.0 - v;
    float lin = val >= FGAMUT_FLOG_LOG_CUT ? (pow(10.0, (val - FGAMUT_FLOG_D) / FGAMUT_FLOG_C) - FGAMUT_FLOG_B) / FGAMUT_FLOG_A : (val - FGAMUT_FLOG_F) / FGAMUT_FLOG_E;
    return v >= FGAMUT_FLOG_F ? lin : -lin;
}

vec3 fujifilmfgamut_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        fLogToLinear(rgb.r),
        fLogToLinear(rgb.g),
        fLogToLinear(rgb.b)
    );
    return FUJI_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_fujifilmfgamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_FUJI_MATRIX * xyz;
    return vec3(
        clamp(linearToFLog(v3.r), 0.0, 1.0),
        clamp(linearToFLog(v3.g), 0.0, 1.0),
        clamp(linearToFLog(v3.b), 0.0, 1.0)
    );
}