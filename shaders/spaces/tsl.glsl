vec3 tsl_to_xyz(vec3 tsl) {
    float T = tsl.x;
    float S = tsl.y;
    float L = tsl.z;

    float theta = (0.5 - T) * TAU;
    float cosT = cos(theta);
    float sinT = sin(theta);
    float m = (sqrt(5.0) / 3.0) * S;

    float denom = (1.0 / 3.0) + m * (0.185 * cosT + 0.473 * sinT);
    float sum = abs(denom) > EPS_PRECISION ? L / denom : 0.0;

    float R = sum * ((1.0 / 3.0) + m * cosT);
    float G = sum * ((1.0 / 3.0) + m * sinT);
    float B = sum * ((1.0 / 3.0) - m * (cosT + sinT));

    return srgbToXyz(vec3(R, G, B));
}

vec3 xyz_to_tsl(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;

    float sum = r + g + b;
    float inv = abs(sum) > EPS_PRECISION ? 1.0 / sum : 0.0;

    float r_prime = r * inv - (1.0 / 3.0);
    float g_prime = g * inv - (1.0 / 3.0);

    float T = 0.0;

    if (abs(r_prime) > EPS_PRECISION || abs(g_prime) > EPS_PRECISION) {
        float theta = atan(g_prime, r_prime);
        T = 0.5 - theta / TAU;
    }

    float S = sqrt((9.0 / 5.0) * (r_prime * r_prime + g_prime * g_prime));
    float L = LUMA_BT601_KR * r + LUMA_BT601_KG * g + LUMA_BT601_KB * b;

    return vec3(
        clamp(T, 0.0, 1.0),
        clamp(S, 0.0, 1.0),
        clamp(L, 0.0, 1.0)
    );
}