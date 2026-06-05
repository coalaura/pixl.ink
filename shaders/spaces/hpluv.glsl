float hpluv_distanceLineFromOrigin(float slope, float intercept) {
    return abs(intercept) / sqrt(slope * slope + 1.0);
}

float hpluv_maxSafeChromaForL(float L) {
    Line bounds[6];
    hsLuvBounds(L, bounds);

    float minDist = 1e38;

    for (int i = 0; i < 6; i++) {
        float dist = hpluv_distanceLineFromOrigin(bounds[i].slope, bounds[i].intercept);

        if (!isnan(dist) && !isinf(dist) && dist >= 0.0 && dist < minDist) {
            minDist = dist;
        }
    }

    return minDist == 1e38 ? 0.0 : minDist;
}

vec3 hpluv_to_xyz(vec3 hpluv) {
    float L = hpluv.z * 100.0;
    float Hdeg = hpluv.x * 360.0;
    float Ppct = hpluv.y * 100.0;

    if (L > 100.0 - EPS_PRECISION) {
        L = 100.0;
    } else if (L < EPS_PRECISION) {
        L = 0.0;
    }

    float uStar = 0.0;
    float vStar = 0.0;

    if (L > EPS_PRECISION && L < 100.0 - EPS_PRECISION && Ppct > EPS_PRECISION) {
        float cMax = hpluv_maxSafeChromaForL(L);
        float C = (cMax * Ppct) / 100.0;

        float hRad = Hdeg * DEG2RAD;

        uStar = C * cos(hRad);
        vStar = C * sin(hRad);
    }

    return cieluv_to_xyz(vec3(
        L / 100.0,
        uStar / 430.0 + 0.5,
        vStar / 430.0 + 0.5
    ));
}

vec3 xyz_to_hpluv(vec3 xyz) {
    vec3 luv = xyz_to_cieluv(xyz);

    float L = luv.x * 100.0;
    float uStar = (luv.y - 0.5) * 430.0;
    float vStar = (luv.z - 0.5) * 430.0;

    if (L > 100.0 - EPS_PRECISION) {
        L = 100.0;
    } else if (L < EPS_PRECISION) {
        L = 0.0;
    }

    float C = length(vec2(uStar, vStar));
    float Hdeg = 0.0;

    if (C > EPS_PRECISION) {
        Hdeg = atan(vStar, uStar) * RAD2DEG;

        if (Hdeg < 0.0) {
            Hdeg += 360.0;
        }
    }

    float Ppct = 0.0;

    if (L > EPS_PRECISION && L < 100.0 - EPS_PRECISION && C > EPS_PRECISION) {
        float cMax = hpluv_maxSafeChromaForL(L);

        if (cMax > EPS_PRECISION) {
            Ppct = (C / cMax) * 100.0;
        }
    }

    float Pnorm = Ppct / 100.0;
    bool achromatic = Pnorm <= EPS_PERCEPTUAL || L <= EPS_PRECISION || L >= 100.0 - EPS_PRECISION;

    return vec3(
        clamp(achromatic ? 0.0 : Hdeg / 360.0, 0.0, 1.0),
        clamp(Pnorm, 0.0, 1.0),
        clamp(L / 100.0, 0.0, 1.0)
    );
}