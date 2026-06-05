vec3 icacb_to_xyz(vec3 icacb) {
    float I = icacb.x;
    float CaN = icacb.y - 0.5;
    float CbN = icacb.z - 0.5;

    vec3 v3 = IPT_TO_LMS_BT2100_MATRIX * vec3(I, CaN, CbN);

    v3 = vec3(hlgDecode(v3.x), hlgDecode(v3.y), hlgDecode(v3.z));

    return LMS_TO_XYZ_BT2100_IPT_MATRIX * v3;
}

vec3 xyz_to_icacb(vec3 xyz) {
    vec3 v3 = XYZ_TO_LMS_BT2100_IPT_MATRIX * xyz;

    v3 = vec3(hlgEncode(v3.x), hlgEncode(v3.y), hlgEncode(v3.z));

    vec3 ipt = LMS_TO_IPT_BT2100_MATRIX * v3;

    return vec3(
        clamp(ipt.x, 0.0, 1.0),
        clamp(ipt.y + 0.5, 0.0, 1.0),
        clamp(ipt.z + 0.5, 0.0, 1.0)
    );
}