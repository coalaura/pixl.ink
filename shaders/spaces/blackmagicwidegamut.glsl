const mat3 BMD_TO_XYZ_MATRIX = mat3(
    vec3(0.551989, 0.243763, -0.048704),
    vec3(0.245591, 0.726210, 0.038487),
    vec3(0.152848, 0.030027, 1.099117)
);

const mat3 XYZ_TO_BMD_MATRIX = mat3(
    vec3(1.975471, -0.662589, 0.110757),
    vec3(-0.669866, 1.481249, -0.081518),
    vec3(-0.256177, -0.051413, 0.920786)
);

const float BMD_A = 0.08692876065491224;
const float BMD_B = 0.005494072432257808;
const float BMD_C = 0.5300133392291939;
const float BMD_D = 8.283605932402494;
const float BMD_E = 0.09246575342465753;
const float BMD_LIN_CUT = 0.005;
const float BMD_LOG_CUT = 0.13388378306427; // BMD_D * BMD_LIN_CUT + BMD_E

float bmdFilmEncode(float lin) {
    if (lin < BMD_LIN_CUT) {
        return BMD_D * lin + BMD_E;
    }
    return BMD_A * log(lin + BMD_B) + BMD_C;
}

float bmdFilmDecode(float logVal) {
    if (logVal < BMD_LOG_CUT) {
        return (logVal - BMD_E) / BMD_D;
    }
    return exp((logVal - BMD_C) / BMD_A) - BMD_B;
}

vec3 blackmagicwidegamut_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        bmdFilmDecode(rgb.r),
        bmdFilmDecode(rgb.g),
        bmdFilmDecode(rgb.b)
    );
    return BMD_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_blackmagicwidegamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_BMD_MATRIX * xyz;
    return vec3(
        clamp(bmdFilmEncode(v3.r), 0.0, 1.0),
        clamp(bmdFilmEncode(v3.g), 0.0, 1.0),
        clamp(bmdFilmEncode(v3.b), 0.0, 1.0)
    );
}