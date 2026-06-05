vec3 rec2100hlg_to_xyz(vec3 rgb) {
    float ref_white_scene = hlgDecode(0.75);
    vec3 rgbLin = vec3(
        hlgDecode(rgb.r) / ref_white_scene,
        hlgDecode(rgb.g) / ref_white_scene,
        hlgDecode(rgb.b) / ref_white_scene
    );
    return REC2020_TO_XYZ_MATRIX * rgbLin;
}

vec3 xyz_to_rec2100hlg(vec3 xyz) {
    vec3 v3 = XYZ_TO_REC2020_MATRIX * xyz;
    float ref_white_scene = hlgDecode(0.75);
    vec3 rgb = vec3(
        hlgEncode(v3.r * ref_white_scene),
        hlgEncode(v3.g * ref_white_scene),
        hlgEncode(v3.b * ref_white_scene)
    );
    return clamp(rgb, 0.0, 1.0);
}