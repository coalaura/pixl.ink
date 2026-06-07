vec3 ntsc_to_linear(vec3 rgb) {
    const float NTSC_GAMMA = 2.2;
    return vec3(
        spow(rgb.r, NTSC_GAMMA),
        spow(rgb.g, NTSC_GAMMA),
        spow(rgb.b, NTSC_GAMMA)
    );
}

vec3 linear_to_ntsc(vec3 rgb) {
    const float NTSC_GAMMA = 2.2;
    return vec3(
        spow(rgb.r, 1.0 / NTSC_GAMMA),
        spow(rgb.g, 1.0 / NTSC_GAMMA),
        spow(rgb.b, 1.0 / NTSC_GAMMA)
    );
}

void get_ntsc_matrices(out mat3 to_xyz, out mat3 to_ntsc) {
    mat3 rgbToXyzC;
    mat3 xyzToRgbC;
    generateMatricesFromPrimaries(
        vec2(0.67, 0.33),
        vec2(0.21, 0.71),
        vec2(0.14, 0.08),
        WHITEPOINT_C,
        rgbToXyzC,
        xyzToRgbC
    );
    preAdaptBradford(rgbToXyzC, WHITEPOINT_C, WHITEPOINT_D65, to_xyz, to_ntsc);
}

vec3 ntsc_to_xyz(vec3 rgb) {
    mat3 to_xyz;
    mat3 to_ntsc;
    get_ntsc_matrices(to_xyz, to_ntsc);
    return to_xyz * ntsc_to_linear(rgb);
}

vec3 xyz_to_ntsc(vec3 xyz) {
    mat3 to_xyz;
    mat3 to_ntsc;
    get_ntsc_matrices(to_xyz, to_ntsc);
    return linear_to_ntsc(to_ntsc * xyz);
}