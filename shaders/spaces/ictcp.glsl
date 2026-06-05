float ictcp_pqDecode(float v) {
    if (v < EPS_PRECISION) {
        return 0.0;
    }

    float p = pow(max(0.0, v), PQ_M2_INV);
    float n = max(p - PQ_C1, 0.0);
    float d = PQ_C2 - PQ_C3 * p;

    return PQ_MAX_LUMINANCE * pow(zdiv(n, d), PQ_M1_INV);
}

float ictcp_pqEncode(float l) {
    if (l < EPS_PRECISION) {
        return 0.0;
    }

    float p = pow(max(0.0, l / PQ_MAX_LUMINANCE), PQ_M1);
    float num = PQ_C1 + PQ_C2 * p;
    float den = 1.0 + PQ_C3 * p;

    return pow(zdiv(num, den), PQ_M2);
}

vec3 ictcp_to_xyz(vec3 ictcp) {
    vec3 ipt = vec3(ictcp.x, ictcp.y - 0.5, ictcp.z - 0.5);
    vec3 lms = IPT_TO_LMS_BT2100_MATRIX * ipt;

    lms.x = ictcp_pqDecode(lms.x) / HDR_REFERENCE_WHITE_NITS;
    lms.y = ictcp_pqDecode(lms.y) / HDR_REFERENCE_WHITE_NITS;
    lms.z = ictcp_pqDecode(lms.z) / HDR_REFERENCE_WHITE_NITS;

    return LMS_TO_XYZ_BT2100_IPT_MATRIX * lms;
}

vec3 xyz_to_ictcp(vec3 xyz) {
    vec3 scaled_xyz = xyz * HDR_REFERENCE_WHITE_NITS;
    vec3 lms = XYZ_TO_LMS_BT2100_IPT_MATRIX * scaled_xyz;

    lms.x = ictcp_pqEncode(lms.x);
    lms.y = ictcp_pqEncode(lms.y);
    lms.z = ictcp_pqEncode(lms.z);

    vec3 ipt = LMS_TO_IPT_BT2100_MATRIX * lms;

    return vec3(
        clamp(ipt.x, 0.0, 1.0),
        clamp(ipt.y + 0.5, 0.0, 1.0),
        clamp(ipt.z + 0.5, 0.0, 1.0)
    );
}