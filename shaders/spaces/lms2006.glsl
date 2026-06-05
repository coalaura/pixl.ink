vec3 lms2006_to_xyz(vec3 lms) {
    return LMS_2006_TO_XYZ_MATRIX * lms;
}

vec3 xyz_to_lms2006(vec3 xyz) {
    return XYZ_TO_LMS_2006_MATRIX * xyz;
}