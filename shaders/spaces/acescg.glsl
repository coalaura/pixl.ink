vec3 acescg_to_xyz(vec3 rgb) {
    return AP1_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_acescg(vec3 xyz) {
    return XYZ_TO_AP1_MATRIX * xyz;
}