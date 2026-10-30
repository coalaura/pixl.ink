const mat3 DWG_TO_XYZ_MATRIX = mat3(
	vec3(0.7003845345758939, 0.27402544915281846, -0.09892931550884504),
	vec3(0.14877487033130418, 0.8736322201321591, -0.13789537624643478),
	vec3(0.10099528894816656, -0.1476576692849777, 1.325083759427527)
);

const mat3 XYZ_TO_DWG_MATRIX = mat3(
	vec3(1.5171871188559687, -0.4649169287095612, 0.06488977602190485),
	vec3(-0.2815736406090655, 1.2514233112972493, 0.10920788953494052),
	vec3(-0.14701354354073187, 0.17488454396805367, 0.7618928339996479)
);

float linearToDI(float v) {
    if (v > 0.00262409) {
        return 0.07329248 * (log2(v + 0.0075) + 7.0);
    }
    return 10.44426855 * v;
}

float diToLinear(float v) {
    if (v > 0.02740668) {
        return exp2(v / 0.07329248 - 7.0) - 0.0075;
    }
    return v / 10.44426855;
}

vec3 davinciwidegamut_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        diToLinear(rgb.r),
        diToLinear(rgb.g),
        diToLinear(rgb.b)
    );
    return DWG_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_davinciwidegamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_DWG_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToDI(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToDI(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToDI(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
