const float DIN99_COSTA = 0.961261695938;
const float DIN99_SINTA = 0.275637355817;
const float DIN99_L99_C1 = 105.509;
const float DIN99_L99_C2 = 0.0158;
const float DIN99_F_SCALE = 0.7;
const float DIN99_C99_K = 0.045;
const float DIN99_A99_MAX = 50.0;
const float DIN99_B99_MAX = 50.0;

vec3 din99_to_xyz(vec3 din) {
    float L99 = din.x * 100.0;
    float a99 = (din.y - 0.5) * 100.0; // 2.0 * A99_MAX = 100.0
    float b99 = (din.z - 0.5) * 100.0; // 2.0 * B99_MAX = 100.0

    float L = (exp(L99 / DIN99_L99_C1) - 1.0) / DIN99_L99_C2;
    float C99 = length(vec2(a99, b99));

    float a = 0.0;
    float b = 0.0;

    if (C99 >= EPS_PRECISION) {
        float G = (exp(DIN99_C99_K * C99) - 1.0) / DIN99_C99_K;
        float e = (a99 * G) / C99;
        float f = (b99 * G) / C99;

        float u = e;
        float v = f / DIN99_F_SCALE;

        a = u * DIN99_COSTA - v * DIN99_SINTA;
        b = u * DIN99_SINTA + v * DIN99_COSTA;
    }

    return cielab_to_xyz(vec3(L / 100.0, a / 260.0 + 0.5, b / 260.0 + 0.5));
}

vec3 xyz_to_din99(vec3 xyz) {
    vec3 labv = xyz_to_cielab(xyz);

    float L = labv.x * 100.0;
    float a = (labv.y - 0.5) * 260.0;
    float b = (labv.z - 0.5) * 260.0;

    float L99 = DIN99_L99_C1 * log(max(EPS_PRECISION, 1.0 + DIN99_L99_C2 * L));

    float e = a * DIN99_COSTA + b * DIN99_SINTA;
    float f = DIN99_F_SCALE * (-a * DIN99_SINTA + b * DIN99_COSTA);

    float G = length(vec2(e, f));

    float a99 = 0.0;
    float b99 = 0.0;

    if (G >= EPS_PRECISION) {
        float C99 = log(1.0 + DIN99_C99_K * G) / DIN99_C99_K;
        a99 = (C99 * e) / G;
        b99 = (C99 * f) / G;
    }

    bool skip = (u_clamped == 0);

    float out_l = clamp_skip(L99 / 100.0, 0.0, 1.0, skip);
    float out_a = clamp_skip(a99, -DIN99_A99_MAX, DIN99_A99_MAX, skip) / (2.0 * DIN99_A99_MAX) + 0.5;
    float out_b = clamp_skip(b99, -DIN99_B99_MAX, DIN99_B99_MAX, skip) / (2.0 * DIN99_B99_MAX) + 0.5;

    return vec3(out_l, out_a, out_b);
}