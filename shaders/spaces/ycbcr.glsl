vec3 ycbcr_to_xyz(vec3 ycbcr) {
    float y = ycbcr.x;
    float cb = ycbcr.y - 0.5;
    float cr = ycbcr.z - 0.5;

    mat3 ycbcr_to_rgb_matrix = mat3(
        vec3(1.0, 1.0, 1.0),
        vec3(0.0, -0.344136, 1.772),
        vec3(1.402, -0.714136, 0.0)
    );

    vec3 rgb = ycbcr_to_rgb_matrix * vec3(y, cb, cr);

    return srgbToXyz(rgb);
}

vec3 xyz_to_ycbcr(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    rgb = clamp(rgb, 0.0, 1.0);

    mat3 rgb_to_ycbcr_matrix = mat3(
        vec3(LUMA_BT601_KR, -0.168736, 0.5),
        vec3(LUMA_BT601_KG, -0.331264, -0.418688),
        vec3(LUMA_BT601_KB, 0.5, -0.081312)
    );

    vec3 ycbcr = rgb_to_ycbcr_matrix * rgb + vec3(0.0, 0.5, 0.5);

    return clamp(ycbcr, 0.0, 1.0);
}