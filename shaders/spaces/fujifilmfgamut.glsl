const mat3 FUJI_TO_XYZ_MATRIX = mat3(
	vec3(0.6367575638699456, 0.262617526341842, 4.99253466463727e-17),
	vec3(0.14464412531584167, 0.6781256933925047, 0.028077977267192723),
	vec3(0.16875300466957738, 0.05925678026565312, 1.0601810904050546)
);

const mat3 XYZ_TO_FUJI_MATRIX = mat3(
	vec3(1.717191679135829, -0.6665588831960222, 0.01765323428139307),
	vec3(-0.35578276745570414, 1.6161770181602182, -0.04280304750419981),
	vec3(-0.2534460542695398, 0.0157655782057216, 0.9428175464548638)
);

const float FGAMUT_FLOG_A = 0.555556;
const float FGAMUT_FLOG_B = 0.009468;
const float FGAMUT_FLOG_C = 0.344676;
const float FGAMUT_FLOG_D = 0.790453;
const float FGAMUT_FLOG_CUT1 = 0.00089;
const float FGAMUT_FLOG_LOG_CUT = 0.10053777522386498;
const float FGAMUT_FLOG_F = 0.092864;
const float FGAMUT_FLOG_E = 8.622219352657277;

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
        clamp_skip(linearToFLog(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToFLog(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToFLog(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
