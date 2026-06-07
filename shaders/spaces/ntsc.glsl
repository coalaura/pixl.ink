const mat3 NTSC_TO_XYZ_MATRIX = mat3(
    vec3(0.598872, 0.296030, -0.000139),
    vec3(0.131998, 0.469429, 0.050664),
    vec3(0.351872, 0.210606, 1.953229)
);

const mat3 XYZ_TO_NTSC_MATRIX = mat3(
    vec3(1.921249, -1.225900, 0.031934),
    vec3(-0.508802, 2.479986, -0.064363),
    vec3(-0.291250, -0.046559, 0.513161)
);

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

vec3 ntsc_to_xyz(vec3 rgb) {
    return NTSC_TO_XYZ_MATRIX * ntsc_to_linear(rgb);
}

vec3 xyz_to_ntsc(vec3 xyz) {
    return linear_to_ntsc(XYZ_TO_NTSC_MATRIX * xyz);
}