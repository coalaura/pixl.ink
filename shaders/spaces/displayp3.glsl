const mat3 DISPLAYP3_TO_XYZ_MATRIX = mat3(
    vec3(0.48657094, 0.22897481, 0.00000000),
    vec3(0.26566843, 0.69173832, 0.04511338),
    vec3(0.19821733, 0.07928687, 1.04378691)
);

const mat3 XYZ_TO_DISPLAYP3_MATRIX = mat3(
    vec3(2.49349691, -0.82948897, 0.03584952),
    vec3(-0.93138362, 1.76266406, -0.07617239),
    vec3(-0.40271078, 0.02362469, 0.95688437)
);

vec3 displayp3_to_xyz(vec3 rgb) {
    vec3 linear_rgb = srgbToLinear(rgb);
    return DISPLAYP3_TO_XYZ_MATRIX * linear_rgb;
}

vec3 xyz_to_displayp3(vec3 xyz) {
    vec3 linear_rgb = XYZ_TO_DISPLAYP3_MATRIX * xyz;
    return linearToSrgb(linear_rgb);
}