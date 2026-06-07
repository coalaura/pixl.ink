const mat3 CANON_CG_TO_XYZ_MATRIX = mat3(
    vec3(0.556015, 0.202925, -0.007516),
    vec3(0.170020, 1.140134, -0.240028),
    vec3(0.224393, -0.343059, 1.336444)
);

const mat3 XYZ_TO_CANON_CG_MATRIX = mat3(
    vec3(2.052678, -0.364467, 0.053919),
    vec3(-0.355106, 1.050604, 0.186641),
    vec3(-0.252084, 0.198947, 0.811801)
);

vec3 canoncinemagamut_to_xyz(vec3 rgb) {
    return CANON_CG_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_canoncinemagamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_CANON_CG_MATRIX * xyz;
    return clamp(v3, 0.0, 1.0);
}