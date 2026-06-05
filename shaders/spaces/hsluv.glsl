float lengthOfRayUntilIntersect(float theta, Line line) {
    float denom = sin(theta) - line.slope * cos(theta);

    if (abs(denom) < EPS_PRECISION) {
        return 1e20; // Infinity
    }

    return line.intercept / denom;
}

float maxChromaForLH(float L, float hDeg) {
    float hRad = hDeg * DEG2RAD;
    Line lines[6];
    hsLuvBounds(L, lines);

    float minLen = 1e20;

    for (int i = 0; i < 6; i++) {
        float len = lengthOfRayUntilIntersect(hRad, lines[i]);

        if (len >= 0.0 && len < minLen) {
            minLen = len;
        }
    }

    return minLen >= 1e19 ? 0.0 : minLen;
}

vec3 lchuvToXyz(float L, float C, float hDeg) {
    float hRad = hDeg * DEG2RAD;
    float uStar = C * cos(hRad);
    float vStar = C * sin(hRad);

    return cieluv_to_xyz(vec3(
        L / 100.0,
        uStar / 430.0 + 0.5,
        vStar / 430.0 + 0.5
    ));
}

vec3 hsluv_to_xyz(vec3 hsluv) {
    float H = hsluv.x * 360.0;
    float S = hsluv.y * 100.0;
    float L = hsluv.z * 100.0;

    if (L <= EPS_PRECISION || (100.0 - L) <= EPS_PRECISION || S <= EPS_PRECISION) {
        return cieluv_to_xyz(vec3(
            L / 100.0,
            0.5,
            0.5
        ));
    }

    float Cmax = maxChromaForLH(L, H);
    float C = (S / 100.0) * Cmax;

    return lchuvToXyz(L, C, H);
}

vec3 xyz_to_hsluv(vec3 xyz) {
    vec3 luvN = xyz_to_cieluv(xyz);

    float L = luvN.x * 100.0;
    float uStar = (luvN.y - 0.5) * 430.0;
    float vStar = (luvN.z - 0.5) * 430.0;

    float C = length(vec2(uStar, vStar));

    float hDeg = 0.0;

    if (C > EPS_PRECISION) {
        hDeg = atan(vStar, uStar) * RAD2DEG;

        if (hDeg < 0.0) {
            hDeg += 360.0;
        }
    }

    float S = 0.0;

    if (C > EPS_PRECISION && L > EPS_PRECISION && (100.0 - L) > EPS_PRECISION) {
        float Cmax = maxChromaForLH(L, hDeg);

        if (Cmax > EPS_PRECISION) {
            S = (C / Cmax) * 100.0;
        }
    }

    float sNorm = S / 100.0;

    bool achromatic = sNorm <= EPS_PERCEPTUAL || C <= EPS_PRECISION;

    return vec3(
        clamp(achromatic ? 0.0 : hDeg / 360.0, 0.0, 1.0),
        clamp(sNorm, 0.0, 1.0),
        clamp(L / 100.0, 0.0, 1.0)
    );
}