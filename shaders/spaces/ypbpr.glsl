vec3 ypbpr_to_xyz(vec3 color) {
    float Y = color.x;
    float Pb = color.y - 0.5;
    float Pr = color.z - 0.5;

    mat3 YPBPR_TO_RGB = mat3(
        vec3(1.0, 1.0, 1.0),
        vec3(0.0, -0.344136, 1.772),
        vec3(1.402, -0.714136, 0.0)
    );

    vec3 rgb = YPBPR_TO_RGB * vec3(Y, Pb, Pr);

    return srgbToXyz(rgb);
}

vec3 xyz_to_ypbpr(vec3 xyz) {
    vec3 rgb = clamp(xyzToSrgb(xyz), 0.0, 1.0);

    mat3 RGB_TO_YPBPR = mat3(
        vec3(LUMA_BT601_KR, -0.168736, 0.5),
        vec3(LUMA_BT601_KG, -0.331264, -0.418688),
        vec3(LUMA_BT601_KB, 0.5, -0.081312)
    );

    vec3 ypbpr = RGB_TO_YPBPR * rgb + vec3(0.0, 0.5, 0.5);

    return clamp(ypbpr, 0.0, 1.0);
}