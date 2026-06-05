const mat3 REC601_TO_XYZ = mat3(
    vec3(0.430541, 0.222004, 0.020182),
    vec3(0.341557, 0.706669, 0.129556),
    vec3(0.178323, 0.071329, 0.939162)
);

const mat3 XYZ_TO_REC601 = mat3(
    vec3(3.063524, -0.969273, 0.067877),
    vec3(-1.393461, 1.875972, -0.228843),
    vec3(-0.475850, 0.041564, 1.069286)
);

vec3 rec601_to_xyz(vec3 rgb) {
    vec3 rLin = rec709ToLinear(rgb);
    return REC601_TO_XYZ * rLin;
}

vec3 xyz_to_rec601(vec3 xyz) {
    vec3 rgbLin = XYZ_TO_REC601 * xyz;
    vec3 rgb = linearToRec709(rgbLin);
    return clamp_skip(rgb, 0.0, 1.0, u_clamped != 0);
}