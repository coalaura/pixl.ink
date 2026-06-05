vec3 okhsv_oklabToLinearRgb_viaXYZ(float L, float a, float b) {
    vec3 labN = vec3(L, a / 0.8 + 0.5, b / 0.8 + 0.5);
    vec3 xyz = oklab_to_xyz(labN);
    return xyzToLinearRgb(xyz);
}

vec2 okhsv_findCusp(float a, float b) {
    float sCusp = okComputeMaxSaturation(a, b);
    vec3 rgb = okhsv_oklabToLinearRgb_viaXYZ(1.0, sCusp * a, sCusp * b);
    float maxChan = max(max(rgb.r, rgb.g), max(rgb.b, 0.0));

    float cusp0 = maxChan > 0.0 ? pow(1.0 / maxChan, 1.0 / 3.0) : 0.0;
    float cusp1 = cusp0 * sCusp;

    return vec2(cusp0, cusp1);
}

vec3 okhsv_to_oklab(vec3 hsv) {
    float h = hsv.x;
    float s = hsv.y;
    float v = hsv.z;

    vec3 outVal;
    outVal.x = okToeInv(v);

    if (outVal.x != 0.0 && s != 0.0) {
        float a_ = cos(TAU * h);
        float b_ = sin(TAU * h);

        vec2 cusp = okhsv_findCusp(a_, b_);

        cusp = okToSt(cusp);

        float s0 = 0.5;
        float k = 1.0 - s0 / cusp.x;

        float lv = 1.0 - (s * s0) / (s0 + cusp.y - cusp.y * k * s);
        float cv = (s * cusp.y * s0) / (s0 + cusp.y - cusp.y * k * s);

        float l = v * lv;
        float c = v * cv;

        float lvt = okToeInv(lv);
        float cvt = zdiv(cv * lvt, lv);

        float lNew = okToeInv(l);

        c = zdiv(c * lNew, l);
        l = lNew;

        vec3 rgbScale = okhsv_oklabToLinearRgb_viaXYZ(lvt, a_ * cvt, b_ * cvt);
        float maxc = max(max(rgbScale.r, rgbScale.g), max(rgbScale.b, 0.0));
        float scaleL = maxc > 0.0 ? pow(1.0 / maxc, 1.0 / 3.0) : 1.0;

        outVal.x = l * scaleL;
        c = c * scaleL;

        outVal.y = c * a_;
        outVal.z = c * b_;
    } else {
        outVal.y = 0.0;
        outVal.z = 0.0;
    }

    return outVal;
}

vec3 oklab_to_okhsv(float L, float a, float b) {
    vec3 outVal;
    outVal.z = okToe(L);

    float c = length(vec2(a, b));

    outVal.x = 0.5 + atan(-b, -a) / TAU;

    if (L != 0.0 && L != 1.0 && c != 0.0) {
        float a_ = a / c;
        float b_ = b / c;

        vec2 cusp = okhsv_findCusp(a_, b_);

        cusp = okToSt(cusp);

        float s0 = 0.5;
        float k = 1.0 - s0 / cusp.x;

        float t = zdiv(cusp.y, c + L * cusp.y);
        float lv = t * L;
        float cv = t * c;

        float lvt = okToeInv(lv);
        float cvt = zdiv(cv * lvt, lv);

        vec3 rgbScale = okhsv_oklabToLinearRgb_viaXYZ(lvt, a_ * cvt, b_ * cvt);
        float maxc = max(max(rgbScale.r, rgbScale.g), max(rgbScale.b, 0.0));
        float scaleL = maxc > 0.0 ? pow(1.0 / maxc, 1.0 / 3.0) : 1.0;

        float L_scaled = L / scaleL;
        float c2 = c / scaleL;

        c2 = zdiv(c2 * okToe(L_scaled), L_scaled);
        L_scaled = okToe(L_scaled);

        outVal.z = zdiv(L_scaled, lv);
        outVal.y = zdiv((s0 + cusp.y) * cv, cusp.y * s0 + cusp.y * k * cv);
    } else {
        outVal.y = 0.0;
    }

    if (abs(outVal.y) < EPS_PERCEPTUAL || outVal.z == 0.0) {
        outVal.x = 0.0;
    }

    return outVal;
}

vec3 okhsv_to_xyz(vec3 hsv) {
    vec3 v3 = okhsv_to_oklab(hsv);

    vec3 labN = vec3(
        v3.x,
        v3.y / 0.8 + 0.5,
        v3.z / 0.8 + 0.5
    );

    return oklab_to_xyz(labN);
}

vec3 xyz_to_okhsv(vec3 xyz) {
    vec3 labN = xyz_to_oklab(xyz);

    float L = labN.x;
    float a = (labN.y - 0.5) * 0.8;
    float b = (labN.z - 0.5) * 0.8;

    vec3 v3 = oklab_to_okhsv(L, a, b);

    return clamp(v3, 0.0, 1.0);
}