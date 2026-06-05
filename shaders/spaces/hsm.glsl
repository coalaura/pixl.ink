const vec3 HSM_U = vec3(3.0 / sqrt(41.0), -4.0 / sqrt(41.0), -4.0 / sqrt(41.0));
const vec3 HSM_V = vec3(-4.0 / sqrt(861.0), 19.0 / sqrt(861.0), -22.0 / sqrt(861.0));

vec3 hsm_dirFromHue(float hNorm) {
    float omega = TAU * hNorm;
    return HSM_U * cos(omega) + HSM_V * sin(omega);
}

float hsm_dMaxDirectional(float m, vec3 dir) {
    float tMax = 1e38;

    if (dir.r > EPS_PRECISION) {
        tMax = min(tMax, (1.0 - m) / dir.r);
    } else if (dir.r < -EPS_PRECISION) {
        tMax = min(tMax, -m / dir.r);
    }

    if (dir.g > EPS_PRECISION) {
        tMax = min(tMax, (1.0 - m) / dir.g);
    } else if (dir.g < -EPS_PRECISION) {
        tMax = min(tMax, -m / dir.g);
    }

    if (dir.b > EPS_PRECISION) {
        tMax = min(tMax, (1.0 - m) / dir.b);
    } else if (dir.b < -EPS_PRECISION) {
        tMax = min(tMax, -m / dir.b);
    }

    if (tMax > 9.9e37) {
        return 0.0;
    }

    return max(tMax, 0.0);
}

vec3 hsm_to_xyz(vec3 hsm) {
    float h = hsm.x;
    float s = hsm.y;
    float m = hsm.z;

    if (s <= EPS_PRECISION) {
        return srgbToXyz(vec3(m));
    }

    vec3 dir = hsm_dirFromHue(h);
    float D = hsm_dMaxDirectional(m, dir);
    float R = s * D;

    vec3 rgb = vec3(m) + R * dir;

    return srgbToXyz(rgb);
}

vec3 xyz_to_hsm(vec3 xyz) {
    vec3 srgb = xyzToSrgb(xyz);

    float m = (4.0 * srgb.r + 2.0 * srgb.g + srgb.b) / 7.0;

    vec3 d_vec = srgb - vec3(m);
    float d2 = dot(d_vec, d_vec);
    float d = sqrt(max(0.0, d2));

    float h = 0.0;

    if (d > EPS_PRECISION) {
        float num = 3.0 * d_vec.r - 4.0 * d_vec.g - 4.0 * d_vec.b;
        float den = sqrt(41.0 * d2);
        float cosTheta = clamp(den > EPS_PRECISION ? num / den : 1.0, -1.0, 1.0);
        float theta = acos(cosTheta);

        h = (srgb.b <= srgb.g ? theta : TAU - theta) / TAU;
    }

    float s = 0.0;

    if (d > EPS_PRECISION) {
        vec3 dir = hsm_dirFromHue(h);
        float D = hsm_dMaxDirectional(m, dir);

        if (D > EPS_PRECISION) {
            s = d / D;
        }
    }

    return vec3(
        clamp(h, 0.0, 1.0),
        clamp(s, 0.0, 1.0),
        clamp(m, 0.0, 1.0)
    );
}