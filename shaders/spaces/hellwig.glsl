const float HELLWIG_C = 0.69;
const float HELLWIG_NC = 1.0;
const float HELLWIG_Z = 1.9272135955;
const float HELLWIG_FL = 0.684;
const vec3 HELLWIG_D_RGB = vec3(1.022878, 0.985209, 0.928663);
const vec3 HELLWIG_D_RGB_INV = vec3(0.977633, 1.014992, 1.076816);
const float HELLWIG_A_W = 37.11661;

float hellwig_eccentricity(float h) {
    float h2 = 2.0 * h;
    float h3 = 3.0 * h;
    float h4 = 4.0 * h;

    return (
        -0.0582 * cos(h) -
        0.0258 * cos(h2) -
        0.1347 * cos(h3) +
        0.0289 * cos(h4) -
        0.1475 * sin(h) -
        0.0308 * sin(h2) +
        0.0385 * sin(h3) +
        0.0096 * sin(h4) +
        1.0
    );
}

vec3 hellwig_to_xyz(vec3 jmh) {
    float J = jmh.x * 100.0;
    float M = jmh.y * 70.0;
    float hDeg = jmh.z * 360.0;

    if (J < EPS_PRECISION) {
        return vec3(0.0);
    }

    float hRad = normalizeAngle360(hDeg) * DEG2RAD;
    float et = hellwig_eccentricity(hRad);

    float A = HELLWIG_A_W * spow(J / 100.0, 1.0 / (HELLWIG_C * HELLWIG_Z));

    float a = 0.0;
    float b = 0.0;

    if (M > EPS_PRECISION) {
        float r = M / (43.0 * HELLWIG_NC * et);
        a = r * cos(hRad);
        b = r * sin(hRad);
    }

    vec3 v3 = M1_MATRIX * vec3(A, a, b);

    vec3 v3_adapted = v3 / 1403.0;
    vec3 v3_unadapted = camUnadapt(v3_adapted, HELLWIG_FL);

    vec3 v3_scaled = v3_unadapted * HELLWIG_D_RGB_INV;
    vec3 xyz_100 = CAT16_INV_MATRIX * v3_scaled;

    return xyz_100 / 100.0;
}

vec3 xyz_to_hellwig(vec3 xyz) {
    if (xyz.x < EPS_PRECISION && xyz.y < EPS_PRECISION && xyz.z < EPS_PRECISION) {
        return vec3(0.0);
    }

    vec3 v3 = CAT16_MATRIX * (xyz * 100.0);

    vec3 v3_adapted = v3 * HELLWIG_D_RGB;
    vec3 v3_final = camAdapt(v3_adapted, HELLWIG_FL);

    float A = 2.0 * v3_final.x + v3_final.y + 0.05 * v3_final.z;
    float a = v3_final.x + (-12.0 * v3_final.y + v3_final.z) / 11.0;
    float b = (v3_final.x + v3_final.y - 2.0 * v3_final.z) / 9.0;

    float J = 100.0 * spow(A / HELLWIG_A_W, HELLWIG_C * HELLWIG_Z);

    float hRad = normalizeAngleRad(atan(b, a));
    float hDeg = hRad * RAD2DEG;
    float et = hellwig_eccentricity(hRad);

    float M = 43.0 * HELLWIG_NC * et * length(vec2(a, b));

    float jN = J / 100.0;
    float mN = M / 70.0;
    float hN = hDeg / 360.0;

    bool isAch = abs(M) < EPS_PRECISION;

    return vec3(
        clamp(jN, 0.0, 1.0),
        clamp(isAch ? 0.0 : mN, 0.0, 1.0),
        clamp(isAch ? 0.0 : hN, 0.0, 1.0)
    );
}