vec3 cmy_to_xyz(vec3 cmy) {
    vec3 rgb = vec3(1.0) - cmy;
    return srgbToXyz(rgb);
}

vec3 xyz_to_cmy(vec3 xyz) {
    vec3 rgb_linear = xyzToLinearRgb(xyz);
    vec3 rgb_srgb = linearToSrgb(rgb_linear);
    vec3 cmy = vec3(1.0) - rgb_srgb;
    return clamp_skip(cmy, 0.0, 1.0, u_clamped != 0);
}