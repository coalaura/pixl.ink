vec3 yiq_to_xyz(vec3 yiq) {
    float Y = yiq.x;
    float I = yiq.y - 0.5;
    float Q = yiq.z - 0.5;

    mat3 YIQ_TO_RGB_MATRIX = mat3(
        vec3(1.000001, 1.0, 1.0),
        vec3(0.956295, -0.272114, -1.106989),
        vec3(0.621024, -0.64738, 1.704615)
    );

    vec3 rgb = YIQ_TO_RGB_MATRIX * vec3(Y, I, Q);

    return srgbToXyz(rgb);
}

vec3 xyz_to_yiq(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);
    rgb = clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);

    mat3 RGB_TO_YIQ_MATRIX = mat3(
        vec3(0.299, 0.595716, 0.211456),
        vec3(0.587, -0.274453, -0.522591),
        vec3(0.114, -0.321263, 0.311135)
    );

    vec3 yiq = RGB_TO_YIQ_MATRIX * rgb;

    vec3 yiq_shifted = vec3(yiq.x, yiq.y + 0.5, yiq.z + 0.5);
    return clamp_skip(yiq_shifted, 0.0, 1.0, u_clamped == 0);
}