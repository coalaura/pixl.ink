vec3 hsp_to_xyz(vec3 hsp) {
    float H = mod(mod(hsp.x, 1.0) + 1.0, 1.0);
    float S = clamp(hsp.y, 0.0, 1.0);
    float P = hsp.z;

    if (S < EPS_PRECISION) {
        return srgbToXyz(vec3(P));
    }

    float minOverMax = 1.0 - S;
    float R = 0.0;
    float G = 0.0;
    float B = 0.0;
    float h = H * 6.0;

    if (minOverMax > EPS_PRECISION) {
        float part = 0.0;
        float invMinOverMax = 1.0 / minOverMax;
        float invMinOverMaxSq = invMinOverMax * invMinOverMax;

        if (h < 1.0) {
            part = 1.0 + h * (invMinOverMax - 1.0);
            B = P / sqrt(LUMA_BT601_KR * invMinOverMaxSq + LUMA_BT601_KG * part * part + LUMA_BT601_KB);
            R = B * invMinOverMax;
            G = B + h * (R - B);
        } else if (h < 2.0) {
            h = 2.0 - h;
            part = 1.0 + h * (invMinOverMax - 1.0);
            B = P / sqrt(LUMA_BT601_KG * invMinOverMaxSq + LUMA_BT601_KR * part * part + LUMA_BT601_KB);
            G = B * invMinOverMax;
            R = B + h * (G - B);
        } else if (h < 3.0) {
            h -= 2.0;
            part = 1.0 + h * (invMinOverMax - 1.0);
            R = P / sqrt(LUMA_BT601_KG * invMinOverMaxSq + LUMA_BT601_KB * part * part + LUMA_BT601_KR);
            G = R * invMinOverMax;
            B = R + h * (G - R);
        } else if (h < 4.0) {
            h = 4.0 - h;
            part = 1.0 + h * (invMinOverMax - 1.0);
            R = P / sqrt(LUMA_BT601_KB * invMinOverMaxSq + LUMA_BT601_KG * part * part + LUMA_BT601_KR);
            B = R * invMinOverMax;
            G = R + h * (B - R);
        } else if (h < 5.0) {
            h -= 4.0;
            part = 1.0 + h * (invMinOverMax - 1.0);
            G = P / sqrt(LUMA_BT601_KB * invMinOverMaxSq + LUMA_BT601_KR * part * part + LUMA_BT601_KG);
            B = G * invMinOverMax;
            R = G + h * (B - G);
        } else {
            h = 6.0 - h;
            part = 1.0 + h * (invMinOverMax - 1.0);
            G = P / sqrt(LUMA_BT601_KR * invMinOverMaxSq + LUMA_BT601_KB * part * part + LUMA_BT601_KG);
            R = G * invMinOverMax;
            B = G + h * (R - G);
        }
    } else {
        float P2 = P * P;
        if (h < 1.0) {
            R = sqrt(P2 / (LUMA_BT601_KR + LUMA_BT601_KG * h * h));
            G = R * h;
            B = 0.0;
        } else if (h < 2.0) {
            h = 2.0 - h;
            G = sqrt(P2 / (LUMA_BT601_KG + LUMA_BT601_KR * h * h));
            R = G * h;
            B = 0.0;
        } else if (h < 3.0) {
            h -= 2.0;
            G = sqrt(P2 / (LUMA_BT601_KG + LUMA_BT601_KB * h * h));
            B = G * h;
            R = 0.0;
        } else if (h < 4.0) {
            h = 4.0 - h;
            B = sqrt(P2 / (LUMA_BT601_KB + LUMA_BT601_KG * h * h));
            G = B * h;
            R = 0.0;
        } else if (h < 5.0) {
            h -= 4.0;
            B = sqrt(P2 / (LUMA_BT601_KB + LUMA_BT601_KR * h * h));
            R = B * h;
            G = 0.0;
        } else {
            h = 6.0 - h;
            R = sqrt(P2 / (LUMA_BT601_KR + LUMA_BT601_KB * h * h));
            B = R * h;
            G = 0.0;
        }
    }

    return srgbToXyz(vec3(R, G, B));
}

vec3 xyz_to_hsp(vec3 xyz) {
    vec3 rgb = clamp(xyzToSrgb(xyz), 0.0, 1.0);
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;

    float P = sqrt(r * r * LUMA_BT601_KR + g * g * LUMA_BT601_KG + b * b * LUMA_BT601_KB);

    float H = 0.0;
    float S = 0.0;

    if (abs(r - g) < EPS_PRECISION && abs(g - b) < EPS_PRECISION) {
        S = 0.0;
        H = 0.0;
    } else if (r >= g && r >= b) {
        H = b >= g ? 1.0 - zdiv(b - g, 6.0 * (r - g)) : zdiv(g - b, 6.0 * (r - b));
        S = 1.0 - zdiv(min(g, b), r);
    } else if (g >= r && g >= b) {
        H = r >= b ? 1.0 / 3.0 - zdiv(r - b, 6.0 * (g - b)) : 1.0 / 3.0 + zdiv(b - r, 6.0 * (g - r));
        S = 1.0 - zdiv(min(r, b), g);
    } else {
        H = g >= r ? 2.0 / 3.0 - zdiv(g - r, 6.0 * (b - r)) : 2.0 / 3.0 + zdiv(r - g, 6.0 * (b - g));
        S = 1.0 - zdiv(min(r, g), b);
    }

    if (H < 0.0) {
         H += 1.0;
    }

    if (S < EPS_PRECISION) {
         H = 0.0;
    }

    return vec3(H, clamp(S, 0.0, 1.0), clamp(P, 0.0, 1.0));
}