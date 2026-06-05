vec3 ncs_get_weights(float h) {
    float H = mod(h, 400.0);
    if (H < 0.0) {
        H += 400.0;
    }

    float Ra = 0.0;
    float Ga = 0.0;
    float Ba = 0.0;

    if (H < 100.0) {
        float N = H;

        if (N <= 60.0) {
            Ra = 1.0;
        } else {
            float x1 = N - 60.0;
            Ra = (sqrt(14884.0 - x1 * x1) - 22.0) / 100.0;
        }

        Ga = (85.0 - 0.85 * N) / 100.0;

        if (N <= 80.0) {
            Ba = 0.0;
        } else {
            float x2 = N - 80.0 + 20.5;
            Ba = (104.0 - sqrt(11236.0 - x2 * x2)) / 100.0;
        }
    } else if (H < 200.0) {
        float N = H - 100.0;

        if (N <= 80.0) {
            float x1 = N + 40.0;
            Ra = (sqrt(14884.0 - x1 * x1) - 22.0) / 100.0;
        } else {
            Ra = 0.0;
        }

        Ga = 0.0;

        if (N <= 60.0) {
            float x2 = N + 20.0 + 20.5;
            Ba = (104.0 - sqrt(11236.0 - x2 * x2)) / 100.0;
        } else {
            float x3 = N - 60.0 - 60.0;
            Ba = (sqrt(10000.0 - x3 * x3) - 10.0) / 100.0;
        }
    } else if (H < 300.0) {
        float N = H - 200.0;

        Ra = 0.0;

        if (N <= 60.0) {
            float x8 = N - 68.5;
            Ga = (6.5 + sqrt(7044.5 - x8 * x8)) / 100.0;
        } else {
            Ga = 0.9;
        }

        if (N <= 80.0) {
            float x3 = N + 40.0 - 60.0;
            Ba = (sqrt(10000.0 - x3 * x3) - 10.0) / 100.0;
        } else {
            float x5 = N - 80.0 - 131.0;
            Ba = (122.0 - sqrt(19881.0 - x5 * x5)) / 100.0;
        }
    } else {
        float N = H - 300.0;

        if (N <= 170.0) {
            float x1 = N - 170.0;
            Ra = (sqrt(33800.0 - x1 * x1) - 70.0) / 100.0;
        } else {
            Ra = 0.0;
        }

        if (N <= 60.0) {
            Ga = 0.9;
        } else {
            float x7 = N - 60.0;
            Ga = (90.0 - 0.125 * x7) / 100.0;
        }

        if (N <= 40.0) {
            float x5 = N + 20.0 - 131.0;
            Ba = (122.0 - sqrt(19881.0 - x5 * x5)) / 100.0;
        } else {
            Ba = 0.0;
        }
    }

    return vec3(Ra, Ga, Ba);
}

float ncs_solve_hue(float r, float g, float b) {
    float maxVal = max(r, max(g, b));
    float minVal = min(r, min(g, b));
    float delta = maxVal - minVal;

    if (delta < EPS_PRECISION) {
        return 0.0;
    }

    float avgInput = (r + g + b) / 3.0;
    float dr = r - avgInput;
    float dg = g - avgInput;
    float db = b - avgInput;
    float range = sqrt(dr * dr + dg * dg + db * db);

    float bestH = 0.0;
    float maxSim = -1.0;

    for (int i = 0; i < 80; i++) {
        float h = float(i) * 5.0;
        vec3 w = ncs_get_weights(h);

        float avgW = (w.x + w.y + w.z) / 3.0;
        float dRa = w.x - avgW;
        float dGa = w.y - avgW;
        float dBa = w.z - avgW;
        float normW = sqrt(dRa * dRa + dGa * dGa + dBa * dBa);

        if (normW > EPS_PRECISION) {
            float sim = (dr * dRa + dg * dGa + db * dBa) / (range * normW);

            if (sim > maxSim) {
                maxSim = sim;
                bestH = h;
            }
        }
    }

    float step_val = 2.0;

    for (int i = 0; i < 5; i++) {
        bool changed = false;

        for (int d_idx = 0; d_idx < 2; d_idx++) {
            float d = (d_idx == 0) ? -step_val : step_val;
            float h = bestH + d;

            vec3 w = ncs_get_weights(h);

            float avgW = (w.x + w.y + w.z) / 3.0;
            float dRa = w.x - avgW;
            float dGa = w.y - avgW;
            float dBa = w.z - avgW;
            float normW = sqrt(dRa * dRa + dGa * dGa + dBa * dBa);

            if (normW > EPS_PRECISION) {
                float sim = (dr * dRa + dg * dGa + db * dBa) / (range * normW);

                if (sim > maxSim) {
                    maxSim = sim;
                    bestH = h;
                    changed = true;
                }
            }
        }
        if (!changed) {
            step_val *= 0.5;
        }
    }

    return mod(bestH + 400.0, 400.0);
}

vec3 ncs_to_xyz(vec3 ncs) {
    float S_user = ncs.x * 100.0;
    float C_user = ncs.y * 100.0;
    float H_user = ncs.z * 400.0;

    float r = 0.0;
    float g = 0.0;
    float b = 0.0;

    if (C_user == 0.0) {
        float v = 1.0 - S_user / 100.0;
        r = v;
        g = v;
        b = v;
    } else {
        vec3 w = ncs_get_weights(H_user);

        float c = C_user / 100.0;
        float avg = (w.x + w.y + w.z) / 3.0;

        float Rc = avg * (1.0 - c) + w.x * c;
        float Gc = avg * (1.0 - c) + w.y * c;
        float Bc = avg * (1.0 - c) + w.z * c;

        float N_FACTOR = 1.05;
        float N_OFFSET = 5.25;

        float S_internal = N_FACTOR * S_user - N_OFFSET;
        float maxVal = max(Rc, max(Gc, Bc));
        float ss = maxVal > EPS_PRECISION ? 1.0 / maxVal : 0.0;

        float factor = (ss * (100.0 - S_internal)) / 100.0;

        r = Rc * factor;
        g = Gc * factor;
        b = Bc * factor;
    }

    return srgbToXyz(clamp(vec3(r, g, b), 0.0, 1.0));
}

vec3 xyz_to_ncs(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    float r = clamp(rgb.x, 0.0, 1.0);
    float g = clamp(rgb.y, 0.0, 1.0);
    float b = clamp(rgb.z, 0.0, 1.0);

    if (abs(r - g) < 0.01 && abs(g - b) < 0.01 && abs(r - b) < 0.01) {
        float avg = (r + g + b) / 3.0;
        return vec3(clamp(1.0 - avg, 0.0, 1.0), 0.0, 0.0);
    }

    float H = ncs_solve_hue(r, g, b);

    float maxRgb = max(r, max(g, b));
    float S_internal = 100.0 * (1.0 - maxRgb);

    float N_FACTOR = 1.05;
    float N_OFFSET = 5.25;
    float S_user = (S_internal + N_OFFSET) / N_FACTOR;

    vec3 w = ncs_get_weights(H);
    float avgW = (w.x + w.y + w.z) / 3.0;

    float denom_rgb = maxRgb == 0.0 ? 1.0 : maxRgb;
    float rNorm = r / denom_rgb;
    float gNorm = g / denom_rgb;
    float bNorm = b / denom_rgb;

    float bestC = 0.0;
    float minErr = 1e30;

    for (int c = 0; c <= 100; c++) {
        float cf = float(c) / 100.0;
        float Rc = avgW * (1.0 - cf) + w.x * cf;
        float Gc = avgW * (1.0 - cf) + w.y * cf;
        float Bc = avgW * (1.0 - cf) + w.z * cf;

        float maxC = max(Rc, max(Gc, Bc));
        float denom_c = maxC == 0.0 ? 1.0 : maxC;

        float Rn = Rc / denom_c;
        float Gn = Gc / denom_c;
        float Bn = Bc / denom_c;

        float dR = Rn - rNorm;
        float dG = Gn - gNorm;
        float dB = Bn - bNorm;
        float err = dR * dR + dG * dG + dB * dB;

        if (err < minErr) {
            minErr = err;
            bestC = float(c);
        }
    }

    return vec3(
        clamp(S_user / 100.0, 0.0, 1.0),
        clamp(bestC / 100.0, 0.0, 1.0),
        clamp(H / 400.0, 0.0, 1.0)
    );
}