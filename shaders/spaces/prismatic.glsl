vec3 prismatic_to_xyz(vec3 pr) {
    float L = pr.x;
    float rp = pr.y;
    float gp = pr.z;
    float bp = 1.0 - rp - gp;

    float mx = max(rp, max(gp, bp));
    float scale = zdiv(L, mx);

    vec3 rgb = vec3(rp, gp, bp) * scale;
    return srgbToXyz(rgb);
}

vec3 xyz_to_prismatic(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;

    float L = max(r, max(g, b));
    float sum = r + g + b;

    float rp = zdiv(r, sum);
    float gp = zdiv(g, sum);

    bool skip = (u_clamped == 0);

    return vec3(
        clamp_skip(L, 0.0, 1.0, skip),
        clamp_skip(rp, 0.0, 1.0, skip),
        clamp_skip(gp, 0.0, 1.0, skip)
    );
}