uniform LabParams u_params;

vec2 uvp1976FromXYZ(vec3 xyz) {
    float denom = xyz.x + 15.0 * xyz.y + 3.0 * xyz.z;
    if (abs(denom) < EPS_PRECISION) {
        return vec2(0.0);
    }
    return vec2((4.0 * xyz.x) / denom, (9.0 * xyz.y) / denom);
}

vec3 cieluv_to_xyz(vec3 luv) {
    float L = luv.x * 100.0;
    float uStar = (luv.y - 0.5) * 430.0;
    float vStar = (luv.z - 0.5) * 430.0;

    if (L < EPS_PRECISION) {
        return vec3(0.0);
    }

    vec3 wp = u_params.wp;
    vec2 upv = uvp1976FromXYZ(wp);

    float up = uStar / (13.0 * L) + upv.x;
    float vp = vStar / (13.0 * L) + upv.y;

    if (abs(vp) < EPS_PERCEPTUAL) {
        return vec3(0.0);
    }

    float Y;
    if (L <= 8.0) {
        Y = L / LAB_KAPPA;
    } else {
        float f = (L + 16.0) / 116.0;
        Y = f * f * f;
    }

    float X = Y * ((9.0 * up) / (4.0 * vp));
    float Z = Y * ((12.0 - 3.0 * up - 20.0 * vp) / (4.0 * vp));

    return vec3(X, Y, Z);
}

vec3 xyz_to_cieluv(vec3 xyz) {
    float X = xyz.x;
    float Y = xyz.y;
    float Z = xyz.z;

    vec2 uvp = uvp1976FromXYZ(xyz);
    
    float L;
    if (Y <= LAB_EPSILON) {
        L = LAB_KAPPA * Y;
    } else {
        L = 116.0 * pow(Y, 1.0 / 3.0) - 16.0;
    }

    if (L < EPS_PERCEPTUAL || isnan(uvp.x) || isinf(uvp.x) || isnan(uvp.y) || isinf(uvp.y)) {
        return vec3(0.0, 0.5, 0.5);
    }

    vec3 wp = u_params.wp;
    vec2 uvpW = uvp1976FromXYZ(wp);

    float uStar = 13.0 * L * (uvp.x - uvpW.x);
    float vStar = 13.0 * L * (uvp.y - uvpW.y);

    bool skip = (u_clamped == 0);

    return vec3(
        clamp_skip(L / 100.0, 0.0, 1.0, skip),
        clamp_skip(uStar / 430.0 + 0.5, 0.0, 1.0, skip),
        clamp_skip(vStar / 430.0 + 0.5, 0.0, 1.0, skip)
    );
}