const mat3 YDBDR_RGB_TO_YDBDR_MATRIX = mat3(
	vec3(0.299, -0.45, -1.333),
	vec3(0.587, -0.883, 1.116),
	vec3(0.114, 1.333, 0.217)
);

const mat3 YDBDR_YDBDR_TO_RGB_MATRIX = mat3(
	vec3(1.0000000000000002, 1.0, 1.0),
	vec3(0.00009230371614760525, -0.12913289889050936, 0.6646790599789548),
	vec3(-0.5259126306618653, 0.2678993282075988, -0.0000792025435331089)
);

vec3 ydbdr_to_xyz(vec3 ydbdr) {
    float Y = ydbdr.x;
    float Db = (ydbdr.y - 0.5) * 2.666;
    float Dr = (ydbdr.z - 0.5) * 2.666;

    vec3 rgb = YDBDR_YDBDR_TO_RGB_MATRIX * vec3(Y, Db, Dr);

    return srgbToXyz(rgb);
}

vec3 xyz_to_ydbdr(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    bool unclamped = (u_clamped == 0);
    rgb = clamp_skip(rgb, 0.0, 1.0, unclamped);

    vec3 ydbdr = YDBDR_RGB_TO_YDBDR_MATRIX * rgb;

    float Y = clamp_skip(ydbdr.x, 0.0, 1.0, unclamped);
    float Db = clamp_skip(ydbdr.y / 2.666 + 0.5, 0.0, 1.0, unclamped);
    float Dr = clamp_skip(ydbdr.z / 2.666 + 0.5, 0.0, 1.0, unclamped);

    return vec3(Y, Db, Dr);
}
