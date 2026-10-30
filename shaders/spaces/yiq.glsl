vec3 yiq_to_xyz(vec3 yiq) {
    float Y = yiq.x;
    float I = (yiq.y - 0.5) * 1.191432;
    float Q = (yiq.z - 0.5) * 1.045182;

    const mat3 YIQ_TO_RGB_MATRIX = mat3(
	vec3(1.0, 1.0, 1.0),
	vec3(0.9562957197589482, -0.27212209931851045, -1.1069890167364902),
	vec3(0.6210244164652611, -0.647380596825695, 1.7046149983646481)
);

    vec3 rgb = YIQ_TO_RGB_MATRIX * vec3(Y, I, Q);

    return srgbToXyz(rgb);
}

vec3 xyz_to_yiq(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);
    rgb = clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);

    const mat3 RGB_TO_YIQ_MATRIX = mat3(
	vec3(0.299, 0.595716, 0.211456),
	vec3(0.587, -0.274453, -0.522591),
	vec3(0.114, -0.321263, 0.311135)
);

    vec3 yiq = RGB_TO_YIQ_MATRIX * rgb;

    vec3 yiq_shifted = vec3(yiq.x, yiq.y / 1.191432 + 0.5, yiq.z / 1.045182 + 0.5);
    return clamp_skip(yiq_shifted, 0.0, 1.0, u_clamped == 0);
}
