vec3 rec2100pq_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        pqDecodeST2084(rgb.r),
        pqDecodeST2084(rgb.g),
        pqDecodeST2084(rgb.b)
    ) / PQ_LUMINANCE_SCALE;

    return REC2020_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_rec2100pq(vec3 xyz) {
    vec3 v3 = XYZ_TO_REC2020_MATRIX * xyz;

    vec3 rgb = vec3(
        pqEncodeST2084(v3.r * PQ_LUMINANCE_SCALE),
        pqEncodeST2084(v3.g * PQ_LUMINANCE_SCALE),
        pqEncodeST2084(v3.b * PQ_LUMINANCE_SCALE)
    );

    return clamp(rgb, 0.0, 1.0);
}