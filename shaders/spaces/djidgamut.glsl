const mat3 DJI_TO_XYZ_MATRIX = mat3(
	vec3(0.6479342767069559, 0.28290088137909347, -0.018251669766393093),
	vec3(0.1940674619794626, 0.8132350787710814, -0.08317176941976966),
	vec3(0.10815295516894638, -0.09613596015017456, 1.1896825068584103)
);

const mat3 XYZ_TO_DJI_MATRIX = mat3(
	vec3(1.7264089932830529, -0.6024152074723549, -0.015629457268243194),
	vec3(-0.4316022483207632, 1.3905076865567259, 0.0905901552343802),
	vec3(-0.19182322147589476, 0.16712927636065658, 0.8493016731102616)
);

const float DJI_CUT1 = 0.014;
const float DJI_A = 0.9892;
const float DJI_B = 0.0108;
const float DJI_C = 0.3;
const float DJI_D = 0.58;
const float DJI_LOG_CUT = 0.09753873429212107;
const float DJI_F = 0.0929;
const float DJI_E = 0.3313381637229335; // (DJI_LOG_CUT - DJI_F) / DJI_CUT1

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
        clamp_skip(linearToDLog(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToDLog(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToDLog(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
