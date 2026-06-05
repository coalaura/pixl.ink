const float KUBELKAMUNK_R_MIN = 1e-4;
const float KUBELKAMUNK_MAX_UI_KS = 4.0;

vec3 kubelkamunk_to_xyz(vec3 km) {
    vec3 k = max(vec3(0.0), km * KUBELKAMUNK_MAX_UI_KS);

    vec3 rgb = 1.0 / (1.0 + k + sqrt(k * (k + 2.0)));

    return linearRgbToXyz(rgb);
}

vec3 xyz_to_kubelkamunk(vec3 xyz) {
    vec3 rgb = xyzToLinearRgb(xyz);

    vec3 rgb_clamped = clamp(rgb, KUBELKAMUNK_R_MIN, 1.0);

    vec3 k = ((1.0 - rgb_clamped) * (1.0 - rgb_clamped)) / (2.0 * rgb_clamped);

    return clamp(k / KUBELKAMUNK_MAX_UI_KS, 0.0, 1.0);
}