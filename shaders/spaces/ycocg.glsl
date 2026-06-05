vec3 ycocg_to_xyz(vec3 ycocg) {
    float y = ycocg.x;
    float co = ycocg.y - 0.5;
    float cg = ycocg.z - 0.5;

    vec3 rgb = vec3(
        y + co - cg,
        y + cg,
        y - co - cg
    );

    return srgbToXyz(rgb);
}

vec3 xyz_to_ycocg(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    mat3 rgb_to_ycocg_mat = mat3(
        vec3(0.25, 0.5, -0.25),
        vec3(0.5, 0.0, 0.5),
        vec3(0.25, -0.5, -0.25)
    );

    vec3 ycocg = rgb_to_ycocg_mat * rgb + vec3(0.0, 0.5, 0.5);

    return clamp(ycocg, 0.0, 1.0);
}