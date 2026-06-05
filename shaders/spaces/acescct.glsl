const float ACESCCT_MIN = 0.0729055341958355;
const float ACESCCT_C1 = 0.0078125;
const float ACESCCT_C2 = 10.5402377416545;
const float ACESCCT_C3 = 0.155251141552511;
const float ACESCCT_MAX = 1.4680027296553901; // (log2(65504.0) + 9.72) / 17.52

vec3 acescct_normToCct(vec3 v) {
    return ACESCCT_MIN + v * (ACESCCT_MAX - ACESCCT_MIN);
}

vec3 acescct_cctToNorm(vec3 code) {
    return (code - ACESCCT_MIN) / (ACESCCT_MAX - ACESCCT_MIN);
}

float acescct_to_linearAP1_scalar(float code) {
    if (code <= ACESCCT_C3) {
        return (code - ACESCCT_MIN) / ACESCCT_C2;
    }

    if (code < ACESCCT_MAX) {
        return pow(2.0, code * 17.52 - 9.72);
    }

    return 65504.0;
}

vec3 acescct_to_linearAP1(vec3 code) {
    return vec3(
        acescct_to_linearAP1_scalar(code.x),
        acescct_to_linearAP1_scalar(code.y),
        acescct_to_linearAP1_scalar(code.z)
    );
}

float acescct_linearAP1_to_scalar(float linear) {
    if (linear <= ACESCCT_C1) {
        return ACESCCT_C2 * linear + ACESCCT_MIN;
    }

    return (log2(max(linear, EPS_PRECISION)) + 9.72) / 17.52;
}

vec3 acescct_linearAP1_to(vec3 linear) {
    return vec3(
        acescct_linearAP1_to_scalar(linear.x),
        acescct_linearAP1_to_scalar(linear.y),
        acescct_linearAP1_to_scalar(linear.z)
    );
}

// ACEScct - Quasi-log ACES encoding (AP1, D60)
vec3 acescct_to_xyz(vec3 acescct) {
    vec3 rc_gc_bc = acescct_normToCct(acescct);

    vec3 r_g_b_lin = acescct_to_linearAP1(rc_gc_bc);

    return AP1_TO_XYZ_MATRIX * r_g_b_lin;
}

vec3 xyz_to_acescct(vec3 xyz) {
    vec3 ap1 = XYZ_TO_AP1_MATRIX * xyz;

    vec3 rc_gc_bc = acescct_linearAP1_to(ap1);

    vec3 norm = acescct_cctToNorm(rc_gc_bc);

    return clamp(norm, 0.0, 1.0);
}