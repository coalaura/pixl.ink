vec3 oklabToLinearRgb_viaXYZ(float L, float a, float b) {
    vec3 labN = vec3(L, a / 0.8 + 0.5, b / 0.8 + 0.5);
    vec3 xyz = oklab_to_xyz(labN);
    return xyzToLinearRgb(xyz);
}

vec2 findCusp(float a, float b) {
    float sCusp = okComputeMaxSaturation(a, b);
    vec3 rgb = oklabToLinearRgb_viaXYZ(1.0, sCusp * a, sCusp * b);
    float maxChan = max(max(rgb.r, rgb.g), max(rgb.b, 0.0));

    float L = maxChan > 0.0 ? pow(1.0 / maxChan, 1.0 / 3.0) : 0.0;
    float C = L * sCusp;

    return vec2(L, C);
}

float findGamutIntersection(float a, float b, float l1, float c1, float l0, vec2 cusp) {
    float t;

    if ((l1 - l0) * cusp.y - (cusp.x - l0) * c1 <= 0.0) {
        t = zdiv(cusp.y * l0, c1 * cusp.x + cusp.y * (l0 - l1));
    } else {
        t = zdiv(cusp.y * (l0 - 1.0), c1 * (cusp.x - 1.0) + cusp.y * (l0 - l1));

        float dl = l1 - l0;
        float dc = c1;

        vec3 k_lms = OKLAB_TO_LMS_PRIME_MATRIX[1] * a + OKLAB_TO_LMS_PRIME_MATRIX[2] * b;
        float kl = k_lms.x;
        float km = k_lms.y;
        float ks = k_lms.z;

        float ldt_ = dl + dc * kl;
        float mdt_ = dl + dc * km;
        float sdt_ = dl + dc * ks;

        float L = l0 * (1.0 - t) + t * l1;
        float C = t * c1;

        float l_ = L + C * kl;
        float m_ = L + C * km;
        float s_ = L + C * ks;

        float l = l_ * l_ * l_;
        float m = m_ * m_ * m_;
        float s = s_ * s_ * s_;

        float ldt = 3.0 * ldt_ * (l_ * l_);
        float mdt = 3.0 * mdt_ * (m_ * m_);
        float sdt = 3.0 * sdt_ * (s_ * s_);

        float ldt2 = 6.0 * (ldt_ * ldt_) * l_;
        float mdt2 = 6.0 * (mdt_ * mdt_) * m_;
        float sdt2 = 6.0 * (sdt_ * sdt_) * s_;

        vec3 rgb_ = LMS_TO_SRGB_LINEAR_MATRIX * vec3(l, m, s);
        vec3 rgb1 = LMS_TO_SRGB_LINEAR_MATRIX * vec3(ldt, mdt, sdt);
        vec3 rgb2 = LMS_TO_SRGB_LINEAR_MATRIX * vec3(ldt2, mdt2, sdt2);

        float r_ = rgb_.r - 1.0;
        float r1 = rgb1.r;
        float r2 = rgb2.r;

        float g_ = rgb_.g - 1.0;
        float g1 = rgb1.g;
        float g2 = rgb2.g;

        float b_ = rgb_.b - 1.0;
        float b1 = rgb1.b;
        float b2 = rgb2.b;

        float ur = zdiv(r1, r1 * r1 - 0.5 * r_ * r2);
        float ug = zdiv(g1, g1 * g1 - 0.5 * g_ * g2);
        float ub = zdiv(b1, b1 * b1 - 0.5 * b_ * b2);

        float tr = -r_ * ur;
        float tg = -g_ * ug;
        float tb = -b_ * ub;

        if (ur < 0.0) {
            tr = 1e38;
        }
        if (ug < 0.0) {
            tg = 1e38;
        }
        if (ub < 0.0) {
            tb = 1e38;
        }

        t += min(tr, min(tg, tb));
    }

    return t;
}

vec2 getStMid(float a, float b) {
    float s = 0.11516993 + 1.0 / (7.4477897 + 4.1590124 * b + a * (-2.19557347 + 1.75198401 * b + a * (-2.13704948 - 10.02301043 * b + a * (-4.24894561 + 5.38770819 * b + 4.69891013 * a))));
    float t = 0.11239642 + 1.0 / (1.6132032 - 0.68124379 * b + a * (0.40370612 + 0.90148123 * b + a * (-0.27087943 + 0.6122399 * b + a * (0.00299215 - 0.45399568 * b - 0.14661872 * a))));
    return vec2(s, t);
}

vec3 getCs(float l, float a, float b) {
    vec2 cusp = findCusp(a, b);

    float c2 = findGamutIntersection(a, b, l, 1.0, l, cusp);

    vec2 st = okToSt(cusp);

    float denom = min(l * st.x, (1.0 - l) * st.y);
    float k = zdiv(c2, denom);

    vec2 mid = getStMid(a, b);
    float sMid = mid.x;
    float tMid = mid.y;

    float ca1 = l * sMid;
    float cb1 = (1.0 - l) * tMid;

    float c1 = 0.0;
    if (ca1 > 1e-4 && cb1 > 1e-4) {
        float ca4 = ca1 * ca1 * ca1 * ca1;
        float cb4 = cb1 * cb1 * cb1 * cb1;
        c1 = 0.9 * k * sqrt(sqrt(1.0 / (1.0 / ca4 + 1.0 / cb4)));
    }

    float ca0 = l * 0.4;
    float cb0 = (1.0 - l) * 0.8;
    float c0 = 0.0;
    if (ca0 > 1e-4 && cb0 > 1e-4) {
        c0 = sqrt(1.0 / (1.0 / (ca0 * ca0) + 1.0 / (cb0 * cb0)));
    }

    return vec3(c0, c1, c2);
}

vec3 okhslToOklab(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    float L = okToeInv(l);
    float a = 0.0;
    float b = 0.0;

    if (L > 0.0 && L < 1.0 && s > 0.0) {
        float a_ = cos(TAU * h);
        float b_ = sin(TAU * h);

        vec3 cMM = getCs(L, a_, b_);

        float mid = 0.8;
        float midInv = 1.25;

        float c;

        if (s < mid) {
            float t = midInv * s;
            float k0 = 0.0;
            float k1 = mid * cMM.x;
            float k2 = 1.0 - zdiv(k1, cMM.y);

            c = k0 + zdiv(t * k1, 1.0 - k2 * t);
        } else {
            float t = 5.0 * (s - 0.8);
            float k0 = cMM.y;
            float k1 = zdiv(0.2 * cMM.y * cMM.y * midInv * midInv, cMM.x);
            float k2 = 1.0 - zdiv(k1, cMM.z - cMM.y);

            c = k0 + zdiv(t * k1, 1.0 - k2 * t);
        }

        a = c * a_;
        b = c * b_;
    }

    return vec3(L, a, b);
}

vec3 oklabToOkhsl(float L, float a, float b) {
    float l = okToe(L);
    float c = length(vec2(a, b));

    float h = 0.5 + atan(-b, -a) / TAU;

    float s = 0.0;

    if (l > 0.0 && abs(1.0 - l) > EPS_PERCEPTUAL && c > 0.0) {
        float a_ = a / c;
        float b_ = b / c;

        vec3 cMM = getCs(L, a_, b_);

        float mid = 0.8;
        float midInv = 1.25;

        if (c < cMM.y) {
            float k1 = mid * cMM.x;
            float k2 = 1.0 - zdiv(k1, cMM.y);
            float t = zdiv(c, k1 + k2 * c);

            s = t * mid;
        } else {
            float k0 = cMM.y;
            float k1 = zdiv(0.2 * cMM.y * cMM.y * midInv * midInv, cMM.x);
            float k2 = 1.0 - zdiv(k1, cMM.z - cMM.y);
            float t = zdiv(c - k0, k1 + k2 * (c - k0));

            s = mid + 0.2 * t;
        }
    }

    bool achromatic = abs(s) < EPS_PERCEPTUAL;

    if (achromatic || l == 0.0 || abs(1.0 - l) < EPS_PERCEPTUAL) {
        h = 0.0;
        if (!achromatic) {
            s = 0.0;
        }
    }

    return vec3(h, s, l);
}

vec3 okhsl_to_xyz(vec3 color) {
    vec3 v3 = okhslToOklab(color);

    vec3 labN = vec3(
        v3.x,
        v3.y / 0.8 + 0.5,
        v3.z / 0.8 + 0.5
    );

    return oklab_to_xyz(labN);
}

vec3 xyz_to_okhsl(vec3 xyz) {
    vec3 labN = xyz_to_oklab(xyz);

    float L = labN.x;
    float a = (labN.y - 0.5) * 0.8;
    float b = (labN.z - 0.5) * 0.8;

    vec3 v3 = oklabToOkhsl(L, a, b);

    return vec3(
        clamp(v3.x, 0.0, 1.0),
        clamp(v3.y, 0.0, 1.0),
        clamp(v3.z, 0.0, 1.0)
    );
}