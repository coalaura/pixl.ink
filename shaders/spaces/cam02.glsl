uniform Cam02Params u_params;

const mat3 CAM02_CAT02_TO_HPE_M = XYZ_TO_LMS_HPE_MATRIX * CAT02_INV_MATRIX;
const mat3 CAM02_HPE_TO_CAT02_MATRIX = CAT02_MATRIX * LMS_TO_XYZ_HPE_MATRIX;

vec3 cam02_to_xyz(vec3 jmh) {
    float J = jmh.x * 100.0;
    float M = jmh.y * 120.0;
    float h = jmh.z * 360.0;

    if (J < EPS_PRECISION) {
        return vec3(0.0);
    }

    float hRad = normalizeAngle360(h) * DEG2RAD;
    float cosh = cos(hRad);
    float sinh = sin(hRad);

    float Jroot = spow(J, 0.5) * 0.1;

    if (M < EPS_PRECISION || Jroot < EPS_PRECISION) {
        float A = u_params.A_W * spow(Jroot, 2.0 / u_params.C / u_params.Z);
        float p2Term = A / u_params.NBB;

        vec3 v3 = M1_MATRIX * vec3(p2Term, 0.0, 0.0);

        vec3 unadapted = camUnadapt(v3 / 1403.0, u_params.FL);

        vec3 hpe_to_cat02 = CAM02_HPE_TO_CAT02_MATRIX * unadapted;
        vec3 final_xyz = CAT02_INV_MATRIX * (hpe_to_cat02 * u_params.D_CAT02_INV);

        return final_xyz / 100.0;
    }

    float alpha = zdiv(M, u_params.FL_ROOT * Jroot);
    float alphaClamp = min(alpha, 1000.0);
    float t = spow(alphaClamp * pow(1.64 - pow(0.29, u_params.N), -0.73), 10.0 / 9.0);

    float et = 0.25 * (cos(hRad + 2.0) + 3.8);
    float A = u_params.A_W * spow(Jroot, 2.0 / u_params.C / u_params.Z);

    float p1Term = (50000.0 / 13.0) * u_params.NC * u_params.NCB * et;
    float p2Term = A / u_params.NBB;

    float denominator = 23.0 * p1Term + t * (11.0 * cosh + 108.0 * sinh);

    if (abs(denominator) < EPS_PRECISION) {
        return vec3(0.0);
    }

    float r = zdiv(23.0 * (p2Term + 0.305) * t, denominator);
    float a = r * cosh;
    float b = r * sinh;

    vec3 v3b = M1_MATRIX * vec3(p2Term, a, b);

    vec3 unadapted = camUnadapt(v3b / 1403.0, u_params.FL);

    vec3 hpe_to_cat02 = CAM02_HPE_TO_CAT02_MATRIX * unadapted;
    vec3 final_xyz = CAT02_INV_MATRIX * (hpe_to_cat02 * u_params.D_CAT02_INV);

    return final_xyz / 100.0;
}

vec3 xyz_to_cam02(vec3 xyz) {
    if (xyz.x < EPS_PRECISION && xyz.y < EPS_PRECISION && xyz.z < EPS_PRECISION) {
        return vec3(0.0);
    }

    vec3 v3 = CAT02_MATRIX * (xyz * 100.0);

    v3 = CAM02_CAT02_TO_HPE_M * (v3 * u_params.D_CAT02);

    v3 = camAdapt(v3, u_params.FL);

    float a = v3.x + (-12.0 * v3.y + v3.z) / 11.0;
    float b = (v3.x + v3.y - 2.0 * v3.z) / 9.0;

    float hRad = normalizeAngleRad(atan(b, a));
    float et = 0.25 * (cos(hRad + 2.0) + 3.8);

    float chromaSum = v3.x + v3.y + 1.05 * v3.z + 0.305;
    float t = (50000.0 / 13.0) * u_params.NC * u_params.NCB * zdiv(et * sqrt(a * a + b * b), chromaSum);

    float alpha = spow(t, 0.9) * pow(1.64 - pow(0.29, u_params.N), 0.73);
    float A = u_params.NBB * (2.0 * v3.x + v3.y + 0.05 * v3.z);

    if (A < EPS_PRECISION) {
        return vec3(0.0);
    }

    float Jroot = spow(A / u_params.A_W, 0.5 * u_params.C * u_params.Z);
    float J = 100.0 * spow(Jroot, 2.0);

    float Cc = alpha * sqrt(J / 100.0);
    float M = Cc * u_params.FL_ROOT;
    float h = hRad * RAD2DEG;

    bool isAchromatic = abs(M) < EPS_PRECISION;

    vec3 result = vec3(
        J / 100.0,
        isAchromatic ? 0.0 : M / 120.0,
        isAchromatic ? 0.0 : h / 360.0
    );

    return clamp_skip(result, 0.0, 1.0, u_clamped == 0);
}