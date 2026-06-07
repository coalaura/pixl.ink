const mat3 DJI_TO_XYZ_MATRIX = mat3(
    vec3(0.648215, 0.283431, -0.073144),
    vec3(0.183765, 0.770020, 0.070002),
    vec3(0.118448, -0.053451, 1.092042)
);

const mat3 XYZ_TO_DJI_MATRIX = mat3(
    vec3(1.722650, -0.621415, 0.155331),
    vec3(-0.413725, 1.458999, -0.121303),
    vec3(-0.160161, -0.174151, 0.932468)
);

const float DJI_CUT1 = 0.014;
const float DJI_A = 0.9892;
const float DJI_B = 0.0108;
const float DJI_C = 0.3;
const float DJI_D = 0.58;
const float DJI_LOG_CUT = 0.097537824707106;
const float DJI_F = 0.0929;
const float DJI_E = 0.331273193364714; // (DJI_LOG_CUT - DJI_F) / DJI_CUT1

float linearToDLog(float v) {
    float val = abs(v);
    float logVal = val >= DJI_CUT1 ? DJI_C * (log(val * DJI_A + DJI_B) / log(10.0)) + DJI_D : DJI_E * val + DJI_F;
    return v >= 0.0 ? logVal : DJI_F * 2.0 - logVal;
}

float dLogToLinear(float v) {
    float val = v >= DJI_F ? v : DJI_F * 2.0 - v;
    float lin = val >= DJI_LOG_CUT ? (pow(10.0, (val - DJI_D) / DJI_C) - DJI_B) / DJI_A : (val - DJI_F) / DJI_E;
    return v >= DJI_F ? lin : -lin;
}

vec3 djidgamut_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        dLogToLinear(rgb.r),
        dLogToLinear(rgb.g),
        dLogToLinear(rgb.b)
    );
    return DJI_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_djidgamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_DJI_MATRIX * xyz;
    return vec3(
        clamp(linearToDLog(v3.r), 0.0, 1.0),
        clamp(linearToDLog(v3.g), 0.0, 1.0),
        clamp(linearToDLog(v3.b), 0.0, 1.0)
    );
}