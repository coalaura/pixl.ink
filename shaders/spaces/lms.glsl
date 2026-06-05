vec3 lms_to_xyz(vec3 lms) {
    return LMS_TO_XYZ_HPE_MATRIX * lms;
}

vec3 xyz_to_lms(vec3 xyz) {
    return XYZ_TO_LMS_HPE_MATRIX * xyz;
}