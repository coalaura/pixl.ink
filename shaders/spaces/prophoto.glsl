void prophoto_get_matrices(out mat3 prophoto_to_xyz_matrix, out mat3 xyz_to_prophoto_matrix) {
    mat3 prophoto_to_xyz_d50;
    mat3 xyz_to_prophoto_d50;
    generateMatricesFromPrimaries(
        vec2(0.734699, 0.265301),
        vec2(0.159597, 0.840403),
        vec2(0.036598, 0.000105),
        WHITEPOINT_D50,
        prophoto_to_xyz_d50,
        xyz_to_prophoto_d50
    );
    preAdaptBradford(
        prophoto_to_xyz_d50,
        WHITEPOINT_D50,
        WHITEPOINT_D65,
        prophoto_to_xyz_matrix,
        xyz_to_prophoto_matrix
    );
}

vec3 prophoto_to_xyz(vec3 rgb) {
    vec3 rgbLin = prophotoToLinear(rgb);

    mat3 to_xyz;
    mat3 to_rgb;
    prophoto_get_matrices(to_xyz, to_rgb);

    return to_xyz * rgbLin;
}

vec3 xyz_to_prophoto(vec3 xyz) {
    mat3 to_xyz;
    mat3 to_rgb;
    prophoto_get_matrices(to_xyz, to_rgb);

    vec3 rgbLin = to_rgb * xyz;
    return linearToProphoto(rgbLin);
}