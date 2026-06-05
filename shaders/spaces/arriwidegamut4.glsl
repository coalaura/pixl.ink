const mat3 AWG4_TO_XYZ_MATRIX = mat3(
    vec3(0.7047321, 0.2544785, 0.0),
    vec3(0.1298695, 0.7814971, 0.0006384),
    vec3(0.1158269, -0.0359756, 1.0882619)
);

const mat3 XYZ_TO_AWG4_MATRIX = mat3(
    vec3(1.509512, -0.491528, 0.0002883),
    vec3(-0.250713, 1.36120, -0.0007985),
    vec3(-0.168949, 0.097313, 0.91884)
);

vec3 arriwidegamut4_to_xyz(vec3 rgb) {
    return AWG4_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_arriwidegamut4(vec3 xyz) {
    return XYZ_TO_AWG4_MATRIX * xyz;
}