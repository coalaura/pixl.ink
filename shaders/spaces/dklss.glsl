mat3 dklss_get_xyz_to_dkl() {
    vec3 lms_w = XYZ_TO_LMS_2006_MATRIX * WHITEPOINT_D65;
    float L_w = lms_w.x;
    float M_w = lms_w.y;
    float S_w = lms_w.z;

    float mc1 = L_w / M_w;
    float mc2 = (L_w + M_w) / S_w;

    mat3 lms_to_dkl = mat3(
        vec3(1.0, 1.0, -1.0),
        vec3(1.0, -mc1, -1.0),
        vec3(0.0, 0.0, mc2)
    );

    return lms_to_dkl * XYZ_TO_LMS_2006_MATRIX;
}

mat3 dklss_get_dkl_to_xyz() {
    vec3 lms_w = XYZ_TO_LMS_2006_MATRIX * WHITEPOINT_D65;
    float L_w = lms_w.x;
    float M_w = lms_w.y;
    float S_w = lms_w.z;

    float sum_LM = L_w + M_w;

    mat3 lms_to_dkl_inv = mat3(
        vec3(L_w / sum_LM, M_w / sum_LM, S_w / sum_LM),
        vec3(M_w / sum_LM, -M_w / sum_LM, 0.0),
        vec3(0.0, 0.0, S_w / sum_LM)
    );

    return LMS_2006_TO_XYZ_MATRIX * lms_to_dkl_inv;
}

vec3 dklss_to_xyz(vec3 dkl) {
    float lum = dkl.x;
    float rg = (dkl.y - 0.5) * 2.0;
    float by = (dkl.z - 0.5) * 2.0;

    mat3 dkl_to_xyz_mat = dklss_get_dkl_to_xyz();
    return dkl_to_xyz_mat * vec3(lum, rg, by);
}

vec3 xyz_to_dklss(vec3 xyz) {
    mat3 xyz_to_dkl_mat = dklss_get_xyz_to_dkl();
    vec3 v3 = xyz_to_dkl_mat * xyz;

    float lum = v3.x;
    float rg = v3.y;
    float by = v3.z;

    return vec3(
        clamp(lum, 0.0, 1.0),
        clamp(rg / 2.0 + 0.5, 0.0, 1.0),
        clamp(by / 2.0 + 0.5, 0.0, 1.0)
    );
}