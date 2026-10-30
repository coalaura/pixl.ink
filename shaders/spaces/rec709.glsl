vec3 rec709_to_xyz(vec3 rgb) {
    return linearRgbToXyz(rec709ToLinear(rgb));
}

vec3 xyz_to_rec709(vec3 xyz) {
    return clamp_skip(linearToRec709(xyzToLinearRgb(xyz)), 0.0, 1.0, u_clamped == 0);
}
