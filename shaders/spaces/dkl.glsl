vec3 dkl_to_xyz(vec3 dkl) {
    float lum = dkl.x;
    float rg = (dkl.y - 0.5) * 2.0;
    float by = (dkl.z - 0.5) * 2.0;

    float l = lum + 0.78 * rg - 0.47 * by;
    float m = lum - 0.78 * rg + 0.47 * by;
    float s = lum + 0.94 * by;

    return LMS_TO_XYZ_HPE_MATRIX * vec3(l, m, s);
}

vec3 xyz_to_dkl(vec3 xyz) {
    vec3 lms = XYZ_TO_LMS_HPE_MATRIX * xyz;

    float l = lms.x;
    float m = lms.y;
    float s = lms.z;

    float lum = (l + m) / 2.0;
    float by = (s - lum) / 0.94;
    float rg = (l - m + 0.94 * by) / 1.56;

    return vec3(
        clamp_skip(lum, 0.0, 1.0, u_clamped == 0),
        clamp_skip(rg / 2.0 + 0.5, 0.0, 1.0, u_clamped == 0),
        clamp_skip(by / 2.0 + 0.5, 0.0, 1.0, u_clamped == 0)
    );
}
