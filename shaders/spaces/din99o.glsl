const float DIN99_THETA = 0.4537856055185257; // 26 * DEG2RAD
const float DIN99_COSTE = 0.898794046299167; // cos(26 * DEG2RAD)
const float DIN99_SINTE = 0.4383711467890774; // sin(26 * DEG2RAD)
const float DIN99_FACTOR = 0.83;
const float DIN99_C1 = 303.6710051218556; // 100.0 / log(1.39)
const float DIN99_C2 = 0.0039;
const float DIN99_C3 = 0.075;
const float DIN99_C4 = 0.0435;
const float DIN99_A_MAX = 55.0;
const float DIN99_B_MAX = 55.0;

vec3 din99o_to_xyz(vec3 din) {
    float L99o = din.x * 100.0;
    float a99o = (din.y - 0.5) * (2.0 * DIN99_A_MAX);
    float b99o = (din.z - 0.5) * (2.0 * DIN99_B_MAX);

    float L = (exp(L99o / DIN99_C1) - 1.0) / DIN99_C2;

    float c99o = length(vec2(a99o, b99o));

    float a = 0.0;
    float b = 0.0;

    if (c99o >= EPS_PRECISION) {
        float h99o = atan(b99o, a99o);
        float g = (exp(DIN99_C4 * c99o) - 1.0) / DIN99_C3;

        float angle = h99o - DIN99_THETA;
        float e = g * cos(angle);
        float f = g * sin(angle);

        a = e * DIN99_COSTE - (f / DIN99_FACTOR) * DIN99_SINTE;
        b = e * DIN99_SINTE + (f / DIN99_FACTOR) * DIN99_COSTE;
    }

    float l_norm = L / 100.0;
    float a_norm = a / 260.0 + 0.5;
    float b_norm = b / 260.0 + 0.5;

    return cielab_to_xyz(vec3(l_norm, a_norm, b_norm));
}

vec3 xyz_to_din99o(vec3 xyz) {
    vec3 lab = xyz_to_cielab(xyz);

    float L = lab.x * 100.0;
    float a = (lab.y - 0.5) * 260.0;
    float b = (lab.z - 0.5) * 260.0;

    float L99o = DIN99_C1 * log(1.0 + DIN99_C2 * L);

    float a99o = 0.0;
    float b99o = 0.0;

    if (abs(a) >= EPS_PRECISION || abs(b) >= EPS_PRECISION) {
        float e = a * DIN99_COSTE + b * DIN99_SINTE;
        float f = DIN99_FACTOR * (b * DIN99_COSTE - a * DIN99_SINTE);

        float g = length(vec2(e, f));

        float c99o = log(1.0 + DIN99_C3 * g) / DIN99_C4;
        float h99o = atan(f, e) + DIN99_THETA;

        a99o = c99o * cos(h99o);
        b99o = c99o * sin(h99o);
    }

    return vec3(
        clamp(L99o / 100.0, 0.0, 1.0),
        clamp(a99o, -DIN99_A_MAX, DIN99_A_MAX) / (2.0 * DIN99_A_MAX) + 0.5,
        clamp(b99o, -DIN99_B_MAX, DIN99_B_MAX) / (2.0 * DIN99_B_MAX) + 0.5
    );
}