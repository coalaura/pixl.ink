vec3 scrgb_to_xyz(vec3 rgb) {
    vec3 rLin = -0.5 + rgb * 8.0;
    return linearRgbToXyz(rLin);
}

vec3 xyz_to_scrgb(vec3 xyz) {
    vec3 rLin = xyzToLinearRgb(xyz);
    vec3 rN = (rLin + 0.5) / 8.0;
    return clamp_skip(rN, 0.0, 1.0, u_clamped == 0);
}