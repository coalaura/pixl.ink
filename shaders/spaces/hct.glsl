uniform Cam16Params u_params;

float toneFromXyz(vec3 xyz) {
    float yRatio = xyz.y <= 0.0 ? 0.0 : xyz.y / WHITEPOINT_D65.y;

    return 116.0 * fLab(yRatio) - 16.0;
}

float toneToY(float tone) {
    if (tone <= 0.0) {
        return 0.0;
    }

    if (tone >= 100.0) {
        return WHITEPOINT_D65.y;
    }

    return fLabInv((tone + 16.0) / 116.0) * WHITEPOINT_D65.y;
}

vec3 labNeutralToXyz(float tone) {
    if (tone <= 0.0) {
        return vec3(0.0);
    }

    if (tone >= 100.0) {
        return WHITEPOINT_D65;
    }

    float ratio = fLabInv((tone + 16.0) / 116.0);

    return ratio * WHITEPOINT_D65;
}

float initialGuessJ(float tone) {
    if (tone >= 0.0) {
        return 0.003790578348640494 * tone * tone + 0.6089841908066893 * tone + 0.9154856839591797;
    }

    return 9.514281401058887e-6 * tone * tone + 0.08693011228986187 * tone - 21.92910930537688;
}

vec3 solveHctNewton(float hue, float chroma, float tone) {
    float targetY = toneToY(tone);
    float targetM = chroma * u_params.FL_ROOT;

    float J = initialGuessJ(tone);
    float bestErr = 1e38;
    bool found = false;
    vec3 bestXYZ = vec3(0.0);

    for (int i = 0; i < 16; i++) {
        vec3 camIn = vec3(J * 0.01, targetM / 105.0, hue);

        vec3 camTmp = cam16_to_xyz(camIn);

        float diff = camTmp.y - targetY;
        float absDiff = abs(diff);

        if (absDiff < bestErr) {
            found = true;
            bestErr = absDiff;

            bestXYZ = camTmp;

            if (absDiff <= EPS_PRECISION) {
                break;
            }
        }

        float denom = camTmp.y <= 0.0 ? 0.0 : 2.0 * camTmp.y;

        if (denom == 0.0) {
            break;
        }

        float prevJ = J;

        J -= diff * (J / denom);

        if (isnan(J) || isinf(J)) {
            break;
        }

        if (J < 0.0) {
            J = 0.0;
        }

        if (abs(prevJ - J) < EPS_PRECISION) {
            break;
        }
    }

    return found ? bestXYZ : labNeutralToXyz(tone);
}

vec3 hct_to_xyz(vec3 hct) {
    float chroma = clamp(hct.y, 0.0, 1.0) * 150.0;
    float tone = clamp(hct.z, 0.0, 1.0) * 100.0;

    if (tone <= 0.0 || chroma < EPS_PRECISION) {
        return labNeutralToXyz(tone);
    }

    if (tone >= 100.0) {
        return WHITEPOINT_D65;
    }

    return solveHctNewton(hct.x, chroma, tone);
}

vec3 xyz_to_hct(vec3 xyz) {
    float tone = toneFromXyz(xyz);

    vec3 jmh = xyz_to_cam16(xyz);

    float chroma = (jmh.y * 105.0) / u_params.FL_ROOT;
    float hue = chroma < EPS_PRECISION ? 0.0 : jmh.z;

    return vec3(
        clamp(hue, 0.0, 1.0),
        clamp(chroma / 150.0, 0.0, 1.0),
        clamp(tone / 100.0, 0.0, 1.0)
    );
}