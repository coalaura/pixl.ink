const float YES_INV_LUMA_DEN = 1.0 - 0.114;
const float YES_KS = 0.114 / YES_INV_LUMA_DEN;
const float YES_KE1 = 0.299 / YES_INV_LUMA_DEN;

vec3 yes_to_xyz(vec3 yes) {
    float y = yes.x;
    float e = (yes.y - 0.5) * 2.0;
    float s = (yes.z - 0.5) * 2.0;

    float gP = y + YES_KS * s - YES_KE1 * e;
    float rP = gP + e;
    float bP = y - s;

    return srgbToXyz(vec3(rP, gP, bP));
}

vec3 xyz_to_yes(vec3 xyz) {
    vec3 rgb = clamp(xyzToSrgb(xyz), 0.0, 1.0);

    float y = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    float e = (rgb.r - rgb.g) / 2.0 + 0.5;
    float s = (y - rgb.b) / 2.0 + 0.5;

    return vec3(
        clamp(y, 0.0, 1.0),
        clamp(e, 0.0, 1.0),
        clamp(s, 0.0, 1.0)
    );
}