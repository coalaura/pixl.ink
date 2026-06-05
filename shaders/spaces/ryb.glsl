const vec3 RYB_CUBE_W = vec3(1.0, 1.0, 1.0);
const vec3 RYB_CUBE_R = vec3(1.0, 0.0, 0.0);
const vec3 RYB_CUBE_Y = vec3(1.0, 1.0, 0.0);
const vec3 RYB_CUBE_O = vec3(1.0, 0.5, 0.0);
const vec3 RYB_CUBE_B = vec3(0.163, 0.373, 0.6);
const vec3 RYB_CUBE_V = vec3(0.5, 0.0, 0.5);
const vec3 RYB_CUBE_G = vec3(0.0, 0.66, 0.2);
const vec3 RYB_CUBE_K = vec3(0.2, 0.094, 0.0);

vec3 forwardRYB(vec3 ryb) {
    float r = ryb.x;
    float y = ryb.y;
    float b = ryb.z;

    vec3 c00 = mix(RYB_CUBE_W, RYB_CUBE_R, r);
    vec3 c10 = mix(RYB_CUBE_Y, RYB_CUBE_O, r);
    vec3 c01 = mix(RYB_CUBE_B, RYB_CUBE_V, r);
    vec3 c11 = mix(RYB_CUBE_G, RYB_CUBE_K, r);

    vec3 c0 = mix(c00, c10, y);
    vec3 c1 = mix(c01, c11, y);

    return mix(c0, c1, b);
}

vec3 jacobianRYB_dr(float r, float y, float b) {
    float r1y = 1.0 - y;
    float r1b = 1.0 - b;
    return (RYB_CUBE_R - RYB_CUBE_W) * (r1y * r1b) +
           (RYB_CUBE_O - RYB_CUBE_Y) * (y * r1b) +
           (RYB_CUBE_V - RYB_CUBE_B) * (r1y * b) +
           (RYB_CUBE_K - RYB_CUBE_G) * (y * b);
}

vec3 jacobianRYB_dy(float r, float y, float b) {
    float r1r = 1.0 - r;
    float r1b = 1.0 - b;
    return (RYB_CUBE_Y - RYB_CUBE_W) * (r1r * r1b) +
           (RYB_CUBE_O - RYB_CUBE_R) * (r * r1b) +
           (RYB_CUBE_G - RYB_CUBE_B) * (r1r * b) +
           (RYB_CUBE_K - RYB_CUBE_V) * (r * b);
}

vec3 jacobianRYB_db(float r, float y, float b) {
    float r1r = 1.0 - r;
    float r1y = 1.0 - y;
    return (RYB_CUBE_B - RYB_CUBE_W) * (r1r * r1y) +
           (RYB_CUBE_V - RYB_CUBE_R) * (r * r1y) +
           (RYB_CUBE_G - RYB_CUBE_Y) * (r1r * y) +
           (RYB_CUBE_K - RYB_CUBE_O) * (r * y);
}

vec3 solve3(vec3 j1, vec3 j2, vec3 j3, vec3 rhs) {
    float a = j1.x, b = j1.y, c = j1.z;
    float d = j2.x, e = j2.y, f = j2.z;
    float g = j3.x, h = j3.y, i = j3.z;

    float A = e * i - f * h;
    float Bc = -(d * i - f * g);
    float Cc = d * h - e * g;
    float D = -(b * i - c * h);
    float E = a * i - c * g;
    float F = -(a * h - b * g);
    float G = b * f - c * e;
    float H = -(a * f - c * d);
    float I = a * e - b * d;

    float det = a * A + b * Bc + c * Cc;

    if (abs(det) < EPS_PRECISION) {
        return vec3(0.0);
    }

    float invDet = 1.0 / det;

    return vec3(
        (A * rhs.x + D * rhs.y + G * rhs.z) * invDet,
        (Bc * rhs.x + E * rhs.y + H * rhs.z) * invDet,
        (Cc * rhs.x + F * rhs.y + I * rhs.z) * invDet
    );
}

vec3 rgbToRyb(vec3 rgbTarget) {
    const int steps = 6;
    float bestE2 = 1e30;
    vec3 best_ryb = vec3(0.5);

    for (int i = 0; i < steps; i++) {
        float r = float(i) / 5.0;
        for (int j = 0; j < steps; j++) {
            float y = float(j) / 5.0;
            for (int k = 0; k < steps; k++) {
                float b = float(k) / 5.0;

                vec3 v3 = forwardRYB(vec3(r, y, b));
                vec3 diff = v3 - rgbTarget;
                float ee = dot(diff, diff);

                if (ee < bestE2) {
                    bestE2 = ee;
                    best_ryb = vec3(r, y, b);
                }
            }
        }
    }

    vec3 curr_ryb = best_ryb;
    const int maxIter = 48;

    for (int it = 0; it < maxIter; it++) {
        vec3 v3 = forwardRYB(curr_ryb);
        vec3 rhs = rgbTarget - v3;

        float e2_old = dot(rhs, rhs);

        vec3 j1 = jacobianRYB_dr(curr_ryb.x, curr_ryb.y, curr_ryb.z);
        vec3 j2 = jacobianRYB_dy(curr_ryb.x, curr_ryb.y, curr_ryb.z);
        vec3 j3 = jacobianRYB_db(curr_ryb.x, curr_ryb.y, curr_ryb.z);

        vec3 sol = solve3(j1, j2, j3, rhs);

        vec3 d;
        if (sol != vec3(0.0)) {
            d = sol;
        } else {
            const float scale = 0.05;
            d = scale * rhs;
        }

        bool improved = false;
        float alpha = 1.0;

        for (int ls = 0; ls < 10; ls++) {
            vec3 c = clamp(curr_ryb + alpha * d, 0.0, 1.0);
            vec3 nf3 = forwardRYB(c);
            vec3 nd = nf3 - rgbTarget;
            float e2_new = dot(nd, nd);

            if (e2_new + EPS_PRECISION < e2_old) {
                curr_ryb = c;
                improved = true;
                break;
            }

            alpha *= 0.5;
        }

        if (!improved) {
            break;
        }

        if (e2_old < EPS_PRECISION) {
            break;
        }
    }

    return curr_ryb;
}

vec3 ryb_to_xyz(vec3 ryb) {
    vec3 v3 = forwardRYB(ryb);
    return srgbToXyz(v3);
}

vec3 xyz_to_ryb(vec3 xyz) {
    vec3 v3 = xyzToSrgb(xyz);
    vec3 ryb = rgbToRyb(v3);
    return clamp(ryb, 0.0, 1.0);
}