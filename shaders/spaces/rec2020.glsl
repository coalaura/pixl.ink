vec3 rec2020_to_xyz(vec3 rgb) {
    vec3 linearRgb = rec709ToLinear(rgb);
    return REC2020_TO_XYZ_MATRIX * linearRgb;
}

vec3 xyz_to_rec2020(vec3 xyz) {
    vec3 linearRgb = XYZ_TO_REC2020_MATRIX * xyz;
    vec3 rgb = linearToRec709(linearRgb);
    return clamp(rgb, 0.0, 1.0);
}