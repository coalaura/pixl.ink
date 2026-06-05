vec3 cmyk_to_xyz(vec4 cmyk) {
    float rGamma = (1.0 - cmyk.x) * (1.0 - cmyk.w);
    float gGamma = (1.0 - cmyk.y) * (1.0 - cmyk.w);
    float bGamma = (1.0 - cmyk.z) * (1.0 - cmyk.w);

    return srgbToXyz(vec3(rGamma, gGamma, bGamma));
}

vec3 cmyk_to_xyz(vec3 color) {
    return cmyk_to_xyz(vec4(color, 0.0));
}

vec4 xyz_to_cmyk_vec4(vec3 xyz) {
    bool skip_clamp = (u_clamped == 0);

    vec3 v3 = xyzToSrgb(xyz);

    float rGamma = clamp_skip(v3.x, 0.0, 1.0, skip_clamp);
    float gGamma = clamp_skip(v3.y, 0.0, 1.0, skip_clamp);
    float bGamma = clamp_skip(v3.z, 0.0, 1.0, skip_clamp);

    float k = 1.0 - max(rGamma, max(gGamma, bGamma));

    float c = 0.0;
    float m = 0.0;
    float y = 0.0;

    if (k < 1.0) {
        c = zdiv(1.0 - rGamma - k, 1.0 - k);
        m = zdiv(1.0 - gGamma - k, 1.0 - k);
        y = zdiv(1.0 - bGamma - k, 1.0 - k);
    }

    return vec4(
        clamp_skip(c, 0.0, 1.0, skip_clamp),
        clamp_skip(m, 0.0, 1.0, skip_clamp),
        clamp_skip(y, 0.0, 1.0, skip_clamp),
        clamp_skip(k, 0.0, 1.0, skip_clamp)
    );
}

vec3 xyz_to_cmyk(vec3 xyz) {
    return xyz_to_cmyk_vec4(xyz).xyz;
}