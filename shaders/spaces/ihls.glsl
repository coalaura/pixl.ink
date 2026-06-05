vec3 ihls_to_xyz(vec3 ihls) {
    float H = ihls.x * 6.0;
    float L = ihls.y;
    float S = ihls.z;

    float C = S;
    float X = C * (1.0 - abs(mod(H, 2.0) - 1.0));

    float r1 = 0.0;
    float g1 = 0.0;
    float b1 = 0.0;

    if (H < 1.0) {
        r1 = C;
        g1 = X;
    } else if (H < 2.0) {
        r1 = X;
        g1 = C;
    } else if (H < 3.0) {
        g1 = C;
        b1 = X;
    } else if (H < 4.0) {
        g1 = X;
        b1 = C;
    } else if (H < 5.0) {
        r1 = X;
        b1 = C;
    } else {
        r1 = C;
        b1 = X;
    }

    float lChrom = LUMA_BT709_KR * r1 + LUMA_BT709_KG * g1 + LUMA_BT709_KB * b1;
    float m = L - lChrom;

    return srgbToXyz(vec3(r1 + m, g1 + m, b1 + m));
}

vec3 xyz_to_ihls(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;

    float maxVal = max(r, max(g, b));
    float minVal = min(r, min(g, b));

    float S = maxVal - minVal;
    float L = LUMA_BT709_KR * r + LUMA_BT709_KG * g + LUMA_BT709_KB * b;

    float H = 0.0;

    if (S > EPS_PRECISION) {
        if (maxVal == r) {
            H = (g - b) / S + (g < b ? 6.0 : 0.0);
        } else if (maxVal == g) {
            H = (b - r) / S + 2.0;
        } else {
            H = (r - g) / S + 4.0;
        }

        H /= 6.0;
    }

    return vec3(
        clamp(H, 0.0, 1.0),
        clamp(L, 0.0, 1.0),
        clamp(S, 0.0, 1.0)
    );
}