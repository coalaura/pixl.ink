const mat3 BMD_TO_XYZ_MATRIX = mat3(
	vec3(0.606437255385914, 0.26794865390478045, -0.029428496308235144),
	vec3(0.22032167062681082, 0.8328162585028276, -0.08653105903252034),
	vec3(0.12339576784264013, -0.10076491240760768, 1.2042186230130034)
);

const mat3 XYZ_TO_BMD_MATRIX = mat3(
	vec3(1.8665386483486457, -0.600235993529504, 0.00248324471604608),
	vec3(-0.5181707425187696, 1.3779078773512266, 0.0863488075222051),
	vec3(-0.23462218056063291, 0.1768045633962206, 0.8373849140573455)
);

const float BMD_A = 0.08692876065491224;
const float BMD_B = 0.005494072432257808;
const float BMD_C = 0.5300133392291939;
const float BMD_D = 8.283605932402494;
const float BMD_E = 0.09246575342465753;
const float BMD_LIN_CUT = 0.005;
const float BMD_LOG_CUT = 0.13388378308667; // BMD_D * BMD_LIN_CUT + BMD_E

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
        clamp_skip(bmdFilmEncode(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(bmdFilmEncode(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(bmdFilmEncode(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
