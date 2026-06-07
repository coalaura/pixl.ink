const mat3 SMPTEC_TO_XYZ_MATRIX = mat3(
    vec3(0.393516, 0.212402, 0.018749),
    vec3(0.365310, 0.701120, 0.111921),
    vec3(0.191602, 0.086478, 0.958230)
);

const mat3 XYZ_TO_SMPTEC_MATRIX = mat3(
    vec3(3.505711, -1.059281, 0.055627),
    vec3(-1.739825, 1.972636, -0.211046),
    vec3(-0.534110, 0.034500, 1.045158)
);

vec3 smptec_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return SMPTEC_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_smptec(vec3 xyz) {
    vec3 v3 = XYZ_TO_SMPTEC_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.2), 0.0, 1.0)
    );
}