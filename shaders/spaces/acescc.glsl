const float ACESCC_C1 = 0.0000152587890625; // 2^-16
const float ACESCC_C2 = 0.000030517578125;  // 2^-15
const float ACESCC_LOG2_CONSTANT = 17.52;
const float ACESCC_MID_GRAY_CONSTANT = 9.72;
const float ACESCC_CC_MIN = -0.3584474885844749; // (log2(C1) + 9.72) / 17.52
const float ACESCC_CC_MAX = 1.467986280962103;  // (log2(65504) + 9.72) / 17.52
const float ACESCC_CC_RANGE = 1.826433769546578; // CC_MAX - CC_MIN

float acescc_to_linear_scalar(float acescc) {
    float cc = acescc * ACESCC_CC_RANGE + ACESCC_CC_MIN;

    if (cc <= ACESCC_CC_MIN) {
        return (pow(2.0, cc * ACESCC_LOG2_CONSTANT - ACESCC_MID_GRAY_CONSTANT) - ACESCC_C1) * 2.0;
    }

    if (cc < ACESCC_CC_MAX) {
        return pow(2.0, cc * ACESCC_LOG2_CONSTANT - ACESCC_MID_GRAY_CONSTANT);
    }

    return 65504.0;
}

float linear_to_acescc_scalar(float linear) {
    float cc;

    if (linear <= 0.0) {
        cc = ACESCC_CC_MIN;
    } else if (linear < ACESCC_C2) {
        cc = (log2(ACESCC_C1 + linear * 0.5) + ACESCC_MID_GRAY_CONSTANT) / ACESCC_LOG2_CONSTANT;
    } else {
        cc = (log2(linear) + ACESCC_MID_GRAY_CONSTANT) / ACESCC_LOG2_CONSTANT;
    }

    return (cc - ACESCC_CC_MIN) / ACESCC_CC_RANGE;
}

vec3 acescc_to_xyz(vec3 acescc) {
    float rLin = acescc_to_linear_scalar(acescc.r);
    float gLin = acescc_to_linear_scalar(acescc.g);
    float bLin = acescc_to_linear_scalar(acescc.b);

    return AP1_TO_XYZ_MATRIX * vec3(rLin, gLin, bLin);
}

vec3 xyz_to_acescc(vec3 xyz) {
    vec3 v3 = XYZ_TO_AP1_MATRIX * xyz;

    return clamp(vec3(
        linear_to_acescc_scalar(v3.x),
        linear_to_acescc_scalar(v3.y),
        linear_to_acescc_scalar(v3.z)
    ), 0.0, 1.0);
}