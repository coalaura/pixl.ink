const mat3 PROPHOTO_TO_XYZ_MATRIX = mat3(
    vec3(0.755420, 0.268292, 0.003918),
    vec3(0.112868, 0.715138, -0.012967),
    vec3(0.082141, 0.016560, 1.097949)
);

const mat3 XYZ_TO_PROPHOTO_MATRIX = mat3(
    vec3(1.403877, -0.526421, -0.011227),
    vec3(-0.223412, 1.481974, 0.018299),
    vec3(-0.101659, 0.017031, 0.911516)
);

vec3 prophoto_to_xyz(vec3 rgb) {
    vec3 rgbLin = prophotoToLinear(rgb);
    return PROPHOTO_TO_XYZ_MATRIX * rgbLin;
}

vec3 xyz_to_prophoto(vec3 xyz) {
    vec3 rgbLin = XYZ_TO_PROPHOTO_MATRIX * xyz;
    return linearToProphoto(rgbLin);
}