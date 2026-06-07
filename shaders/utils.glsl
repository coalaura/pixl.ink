#version 300 es
precision highp float;

// Whitepoint Names
#define WP_A 0
#define WP_B 1
#define WP_C 2
#define WP_D40 3
#define WP_D50 4
#define WP_D55 5
#define WP_D60 6
#define WP_D65 7
#define WP_D70 8
#define WP_D75 9
#define WP_E 10
#define WP_F2 11
#define WP_F7 12
#define WP_F11 13
#define WP_ID50 14
#define WP_ID65 15
#define WP_LEDB1 16
#define WP_LEDB2 17
#define WP_LEDB3 18
#define WP_LEDB4 19
#define WP_LEDB5 20

// Observer Names
#define OBS_2 0
#define OBS_10 1

// Numeric constants
const float EPS_PRECISION = 1e-12;
const float EPS_PERCEPTUAL = 1e-3;

const float TAU = 6.283185307179586;
const float RAD2DEG = 57.29577951308232;
const float DEG2RAD = 0.017453292519943295;

// Whitepoints
const vec3 WHITEPOINT_C = vec3(0.98070597, 1.0, 1.18224949);
const vec3 WHITEPOINT_D50 = vec3(0.963906, 1.0, 0.824747);
const vec3 WHITEPOINT_D60 = vec3(0.95264, 1.0, 1.00882);
const vec3 WHITEPOINT_D65 = vec3(0.9504285, 1.0, 1.0889003);
const vec3 WHITEPOINT_E = vec3(1.0, 1.0, 1.0);

// Matrices
const mat3 BRADFORD_MATRIX = mat3(
    vec3(0.8951, -0.7502, 0.0389),
    vec3(0.2664, 1.7135, -0.0685),
    vec3(-0.1614, 0.0367, 1.0296)
);

const mat3 BRADFORD_INV_MATRIX = mat3(
    vec3(0.9869929, 0.4323053, -0.0085287),
    vec3(-0.1470543, 0.5183603, 0.0400428),
    vec3(0.1599627, 0.0492912, 0.9684867)
);

const mat3 CAT02_MATRIX = mat3(
    vec3(0.7328, -0.7036, 0.0030),
    vec3(0.4296, 1.6975, 0.0136),
    vec3(-0.1624, 0.0061, 0.9834)
);

const mat3 CAT02_INV_MATRIX = mat3(
    vec3(1.0961238, 0.4543690, -0.0096280),
    vec3(-0.2788690, 0.4735332, -0.0057980),
    vec3(0.1827455, 0.0720984, 1.0153258)
);

const mat3 CAT16_MATRIX = mat3(
    vec3(0.401288, -0.250268, -0.002079),
    vec3(0.650173, 1.204414, 0.048952),
    vec3(-0.051461, 0.045854, 0.953127)
);

const mat3 CAT16_INV_MATRIX = mat3(
    vec3(1.8620378, 0.3875110, -0.0158410),
    vec3(-1.0112546, 0.6214244, -0.0341230),
    vec3(0.1492167, -0.0089740, 1.0499720)
);

const mat3 M1_MATRIX = mat3(
    vec3(460.0, 460.0, 460.0),
    vec3(451.0, -891.0, -220.0),
    vec3(288.0, -261.0, -6300.0)
);

const mat3 REC2020_TO_XYZ_MATRIX = mat3(
    vec3(0.636958, 0.262700, 0.000000),
    vec3(0.144617, 0.677998, 0.028073),
    vec3(0.168881, 0.059302, 1.060985)
);

const mat3 XYZ_TO_REC2020_MATRIX = mat3(
    vec3(1.716651, -0.666684, 0.017640),
    vec3(-0.355671, 1.616481, -0.042771),
    vec3(-0.253366, 0.015768, 0.942112)
);

const mat3 AP1_TO_XYZ_MATRIX = mat3(
    vec3(0.662454, 0.272118, -0.005559),
    vec3(0.134005, 0.674082, 0.004060),
    vec3(0.156187, 0.053799, 1.010373)
);

const mat3 XYZ_TO_AP1_MATRIX = mat3(
    vec3(1.641611, -0.663248, 0.011641),
    vec3(-0.325805, 1.615330, -0.008304),
    vec3(-0.236681, 0.016398, 0.989295)
);

const mat3 CONE_TO_XYZ_JZAZBZ_MATRIX = mat3(
    vec3(1.9242264357876067, 0.3503167620949991, -0.0909828109828475),
    vec3(-1.0047923125953657, 0.7264811939316552, -0.3127282905230739),
    vec3(0.037651404030618, -0.065384422948085, 1.5227665613052603)
);

const mat3 XYZ_TO_CONE_JZAZBZ_MATRIX = mat3(
    vec3(0.4147897, -0.2014980, -0.0166008),
    vec3(0.5799990, 1.1206480, 0.2647790),
    vec3(0.0146305, 0.0531008, 0.6684270)
);

const mat3 OKLAB_TO_LMS_PRIME_MATRIX = mat3(
    vec3(1.0, 1.0, 1.0),
    vec3(0.3963377774, -0.1055613458, -0.0894841775),
    vec3(0.2158037573, -0.0638541728, -1.291485548)
);

const mat3 LMS_PRIME_TO_OKLAB_MATRIX = mat3(
    vec3(0.2104542553, 1.9779984951, 0.0259040371),
    vec3(0.7936177850, -2.4285922050, 0.7827717662),
    vec3(-0.0040720468, 0.4505937099, -0.8086757660)
);

const mat3 OKLAB_LMS_TO_XYZ_MATRIX = mat3(
    vec3(1.2270138511, -0.0405801784, -0.0763812845),
    vec3(-0.5577999807, 1.1122568696, -0.4214819784),
    vec3(0.281256149, -0.0716766787, 1.5861632204)
);

const mat3 OKLAB_XYZ_TO_LMS_MATRIX = mat3(
    vec3(0.8189330, 0.0329845, 0.0482003),
    vec3(0.3618667, 0.9293119, 0.2643663),
    vec3(-0.1288597, 0.0361456, 0.6338517)
);

const mat3 LMS_TO_SRGB_LINEAR_MATRIX = mat3(
    vec3(4.0767416360759583, -1.2684379732850315, -0.0041960761386756),
    vec3(-3.3077115392580629, 2.6097573492876882, -0.7034186179359362),
    vec3(0.2309699031821043, -0.341319376002657, 1.7076146940746117)
);

const mat3 LINEAR_RGB_TO_XYZ_MATRIX = mat3(
    vec3(0.4124564, 0.2126729, 0.0193339),
    vec3(0.3575761, 0.7151522, 0.1191920),
    vec3(0.1804375, 0.0721750, 0.9503041)
);

const mat3 XYZ_TO_LINEAR_RGB_MATRIX = mat3(
    vec3(3.2404542, -0.9692660, 0.0556434),
    vec3(-1.5371385, 1.8760108, -0.2040259),
    vec3(-0.4985314, 0.0415560, 1.0572252)
);

const mat3 LMS_TO_XYZ_HPE_MATRIX = mat3(
    vec3(1.9101968341704306, 0.370950088249105, 0.0),
    vec3(-1.1121238620490023, 0.6290541866113667, 0.0),
    vec3(0.2019072850149422, -0.0000018248604712, 1.0)
);

const mat3 XYZ_TO_LMS_HPE_MATRIX = mat3(
    vec3(0.3897120, -0.2298100, 0.0),
    vec3(0.6889820, 1.1834000, 0.0),
    vec3(-0.0786800, 0.0464100, 1.0)
);

const mat3 XYZ_TO_LMS_2006_MATRIX = mat3(
    vec3(0.185082982238733, -0.134433056469973, 0.000789456671966863),
    vec3(0.584081279463687, 0.405752392775348, -0.000912281325916184),
    vec3(-0.0240722415044404, 0.0358252602217631, 0.0198490812339463)
);

const mat3 LMS_2006_TO_XYZ_MATRIX = mat3(
    vec3(2.628485361250280, 0.876537968565256, -0.064256497354157),
    vec3(-3.761279314418931, 1.200308658826066, 0.204764414161756),
    vec3(9.976398059715568, -1.103382903260907, 49.932839958045580)
);

const mat3 LMS_TO_XYZ_BT2100_IPT_MATRIX = mat3(
    vec3(2.0701522183894223, 0.3647385209748072, -0.0497472075358123),
    vec3(-1.3263473389671563, 0.6805660249472273, -0.0492609666966131),
    vec3(0.2066510476294053, -0.0453045459220347, 1.1880659249923042)
);

const mat3 XYZ_TO_LMS_BT2100_IPT_MATRIX = mat3(
    vec3(0.359277, -0.192080, 0.007079),
    vec3(0.697609, 1.100487, 0.074838),
    vec3(-0.035890, 0.075372, 0.843290)
);

const mat3 LMS_TO_IPT_BT2100_MATRIX = mat3(
    vec3(0.5, 1.6137695, 4.3781738),
    vec3(0.5, -3.3234863, -4.2456055),
    vec3(0.0, 1.7097168, -0.1325684)
);

const mat3 IPT_TO_LMS_BT2100_MATRIX = mat3(
    vec3(1.0, 1.0, 1.0),
    vec3(0.0086090, -0.0086090, 0.5600271),
    vec3(0.1110296, -0.1110296, -0.3206271)
);

const mat3 LMSP_TO_IZAZBZ = mat3(
    vec3(0.0, 3.524, 0.199076),
    vec3(1.0, -4.066708, 1.096799),
    vec3(0.0, 0.542708, -1.295875)
);

const mat3 IZAZBZ_TO_LMSP = mat3(
    vec3(1.0, 1.0, 1.0),
    vec3(0.27721004, 0.0, 0.04258581),
    vec3(0.11609466, 0.0, -0.75384474)
);

// Luma constants
const float LUMA_BT709_KR = 0.2126;
const float LUMA_BT709_KG = 0.7152;
const float LUMA_BT709_KB = 0.0722;

const float LUMA_BT601_KR = 0.299;
const float LUMA_BT601_KG = 0.587;
const float LUMA_BT601_KB = 0.114;

// Model Constants
const float JZAZBZ_AZBZ_SCALE = 0.42;

const float CAM_ADAPTED_COEF = 0.42;
const float CAM_ADAPTED_COEF_INV = 1.0 / 0.42;

const float CAM_UCS_K = 1.7;
const float CAM_UCS_C1 = 0.007;
const float CAM_UCS_C2 = 0.0228;

const float LAB_EPSILON = 216.0 / 24389.0;
const float LAB_KAPPA = 24389.0 / 27.0;

const float OK_TOE_K1 = 0.206;
const float OK_TOE_K2 = 0.03;
const float OK_TOE_K3 = (1.0 + 0.206) / (1.0 + 0.03);

const float HLG_A = 0.17883277;
const float HLG_B = 1.0 - 4.0 * 0.17883277;
const float HLG_C = 0.55991073;

const float PRE_ADAPT_B = 1.15;
const float PRE_ADAPT_G = 0.66;

const float PQ_M1 = 2610.0 / 16384.0;
const float PQ_M1_INV = 16384.0 / 2610.0;

const float PQ_M2 = 2523.0 / 32.0;
const float PQ_M2_INV = 32.0 / 2523.0;

const float PQ_C1 = 3424.0 / 4096.0;
const float PQ_C2 = 2413.0 / 128.0;
const float PQ_C3 = 2392.0 / 128.0;

const float PQ_P = 134.034375;
const float PQ_P_INV = 1.0 / 134.034375;

const float PQ_MAX_LUMINANCE = 10000.0;
const float HDR_REFERENCE_WHITE_NITS = 203.0;
const float PQ_LUMINANCE_SCALE = 203.0 / 10000.0;

const float IZ_OFFSET = 3.7035226210190005e-11;

// Structs for dynamic options parameters
struct Cam02Params {
    float C;
    float NC;
    float FL;
    float FL_ROOT;
    float N;
    float Z;
    float NBB;
    float NCB;
    vec3 D_CAT02;
    vec3 D_CAT02_INV;
    float A_W;
};

struct Cam16Params {
    float C;
    float NC;
    float FL;
    float FL_ROOT;
    float N;
    float Z;
    float NBB;
    float NCB;
    vec3 D_RGB;
    vec3 D_RGB_INV;
    float A_W;
};

struct LabParams {
    vec3 wp;
};

struct HunterParams {
    vec3 wp;
    float KA;
    float KB;
};

struct RlabParams {
    mat3 RAM;
    mat3 IRAM;
    float sigma;
    float sigmaInv;
};

struct ZcamParams {
    float FL;
    float D_ADAPT;
    vec3 wp;
    float F;
    float C;
    float Yw;
    float Yb;
    float La;
    float FB;
    float ALPHA;
    float KQ;
    float QZ_W;
};

struct Line {
    float slope;
    float intercept;
};

// Helpers
float clamp_skip(float value, float minVal, float maxVal, bool skip) {
    if (skip) {
        return value;
    }
    return clamp(value, minVal, maxVal);
}

vec3 clamp_skip(vec3 value, float minVal, float maxVal, bool skip) {
    if (skip) {
        return value;
    }
    return clamp(value, minVal, maxVal);
}

float lerp(float start, float end, float t) {
    return start * (1.0 - t) + end * t;
}

mat3 invert3x3(mat3 m) {
    float a = m[0][0], b = m[1][0], c = m[2][0];
    float d = m[0][1], e = m[1][1], f = m[2][1];
    float g = m[0][2], h = m[1][2], i = m[2][2];

    float A = e * i - f * h;
    float B = -(d * i - f * g);
    float C = d * h - e * g;
    float D = -(b * i - c * h);
    float E = a * i - c * g;
    float F = -(a * h - b * g);
    float G = b * f - c * e;
    float H = -(a * f - c * d);
    float I = a * e - b * d;

    float det = a * A + b * B + c * C;

    if (abs(det) < EPS_PRECISION) {
        return mat3(0.0);
    }

    float invDet = 1.0 / det;

    return mat3(
        vec3(A * invDet, B * invDet, C * invDet),
        vec3(D * invDet, E * invDet, F * invDet),
        vec3(G * invDet, H * invDet, I * invDet)
    );
}

vec3 xyToXyzY1(float x, float y) {
    if (y == 0.0) {
        return vec3(0.0);
    }

    float X = x / y;
    float Y = 1.0;
    float Z = (1.0 - x - y) / y;

    return vec3(X, Y, Z);
}

vec3 xyToXyzY1(vec2 xy) {
    return xyToXyzY1(xy.x, xy.y);
}

vec2 calculateDaylight_xy(float T) {
    if (T < 4000.0 || T > 25000.0) {
        return vec2(0.3127, 0.3291); // Fast fallback instead of throwing error on GPU
    }

    float x_d;

    if (T <= 7000.0) {
        // 4000K to 7000K
        x_d = (-4.607e9) / (T * T * T) + (2.9678e6) / (T * T) + (0.09911e3) / T + 0.244063;
    } else {
        // 7000K to 25000K
        x_d = (-2.0064e9) / (T * T * T) + (1.9018e6) / (T * T) + (0.24748e3) / T + 0.23704;
    }

    // Calculate y derived from x
    float y_d = -3.0 * x_d * x_d + 2.87 * x_d - 0.275;

    return vec2(x_d, y_d);
}

vec2 calculatePlanckian_xy(float T) {
    // Approximation typically valid for 1667K to 25000K
    float x_c = (-0.2661239e9) / (T * T * T) - (0.2343589e6) / (T * T) + (0.8776956e3) / T + 0.17991;

    float y_c;

    if (T < 4000.0) {
        y_c = -1.1063814 * (x_c * x_c * x_c) - 1.3481102 * (x_c * x_c) + 2.18555832 * x_c - 0.20219683;
    } else {
        y_c = -0.9549476 * (x_c * x_c * x_c) - 1.37418593 * (x_c * x_c) + 2.09137015 * x_c - 0.16748867;
    }

    return vec2(x_c, y_c);
}

vec3 getWhitepointXYZ(int name, int observer) {
    if (observer == OBS_2) {
        if (name == WP_A) return xyToXyzY1(calculatePlanckian_xy(2856.0));
        if (name == WP_B) return xyToXyzY1(0.34842, 0.35161);
        if (name == WP_C) return xyToXyzY1(0.31006, 0.31616);
        if (name == WP_D40) return xyToXyzY1(calculateDaylight_xy(4000.0));
        if (name == WP_D50) return xyToXyzY1(calculateDaylight_xy(5003.0));
        if (name == WP_D55) return xyToXyzY1(calculateDaylight_xy(5503.0));
        if (name == WP_D60) return xyToXyzY1(calculateDaylight_xy(6000.0));
        if (name == WP_D65) return xyToXyzY1(calculateDaylight_xy(6504.0));
        if (name == WP_D70) return xyToXyzY1(calculateDaylight_xy(7000.0));
        if (name == WP_D75) return xyToXyzY1(calculateDaylight_xy(7504.0));
        if (name == WP_E) return vec3(1.0, 1.0, 1.0);
        if (name == WP_F2) return xyToXyzY1(0.37208, 0.37529);
        if (name == WP_F7) return xyToXyzY1(0.31292, 0.32933);
        if (name == WP_F11) return xyToXyzY1(0.38052, 0.37713);
        if (name == WP_ID50) return xyToXyzY1(0.3432, 0.3602);
        if (name == WP_ID65) return xyToXyzY1(0.3107, 0.3307);
        if (name == WP_LEDB1) return xyToXyzY1(0.456, 0.4078);
        if (name == WP_LEDB2) return xyToXyzY1(0.4357, 0.4012);
        if (name == WP_LEDB3) return xyToXyzY1(0.3756, 0.3723);
        if (name == WP_LEDB4) return xyToXyzY1(0.3422, 0.3502);
        if (name == WP_LEDB5) return xyToXyzY1(0.3118, 0.3236);
    } else { // OBS_10
        if (name == WP_A) return xyToXyzY1(0.45117, 0.40594);
        if (name == WP_B) return xyToXyzY1(0.3498, 0.3527);
        if (name == WP_C) return xyToXyzY1(0.31039, 0.31905);
        if (name == WP_D40) return xyToXyzY1(0.38716, 0.39096);
        if (name == WP_D50) return xyToXyzY1(0.34773, 0.35952);
        if (name == WP_D55) return xyToXyzY1(0.33411, 0.34877);
        if (name == WP_D60) return xyToXyzY1(0.32296, 0.33914);
        if (name == WP_D65) return xyToXyzY1(0.31382, 0.33100);
        if (name == WP_D70) return xyToXyzY1(0.30535, 0.32788);
        if (name == WP_D75) return xyToXyzY1(0.29968, 0.31740);
        if (name == WP_E) return vec3(1.0, 1.0, 1.0);
        if (name == WP_F2) return xyToXyzY1(0.37925, 0.36733);
        if (name == WP_F7) return xyToXyzY1(0.31569, 0.32960);
        if (name == WP_F11) return xyToXyzY1(0.38541, 0.37123);
        if (name == WP_ID50) return xyToXyzY1(0.3491, 0.3634);
        if (name == WP_ID65) return xyToXyzY1(0.3159, 0.3343);
        if (name == WP_LEDB1) return xyToXyzY1(0.4600, 0.4053);
        if (name == WP_LEDB2) return xyToXyzY1(0.4402, 0.3995);
        if (name == WP_LEDB3) return xyToXyzY1(0.3806, 0.3721);
        if (name == WP_LEDB4) return xyToXyzY1(0.3463, 0.3516);
        if (name == WP_LEDB5) return xyToXyzY1(0.3157, 0.3262);
    }
    return WHITEPOINT_D65; // fallback
}

void generateMatricesFromPrimaries(vec2 red, vec2 green, vec2 blue, vec3 referenceWhite, out mat3 rgbToXyz, out mat3 xyzToRgb) {
    float rx = red.x, ry = red.y;
    float gx = green.x, gy = green.y;
    float bx = blue.x, by = blue.y;

    float rz = 1.0 - rx - ry;
    float gz = 1.0 - gx - gy;
    float bz = 1.0 - bx - by;

    float Xr = rx / ry;
    float Yr = 1.0;
    float Zr = rz / ry;

    float Xg = gx / gy;
    float Yg = 1.0;
    float Zg = gz / gy;

    float Xb = bx / by;
    float Yb = 1.0;
    float Zb = bz / by;

    mat3 M = mat3(
        vec3(Xr, Yr, Zr),
        vec3(Xg, Yg, Zg),
        vec3(Xb, Yb, Zb)
    );

    mat3 Minv = invert3x3(M);
    vec3 S = Minv * referenceWhite;

    float Sr = S.x, Sg = S.y, Sb = S.z;

    rgbToXyz = mat3(
        vec3(Xr * Sr, Yr * Sr, Zr * Sr),
        vec3(Xg * Sg, Yg * Sg, Zg * Sg),
        vec3(Xb * Sb, Yb * Sb, Zb * Sb)
    );

    xyzToRgb = invert3x3(rgbToXyz);
}

float spow(float baseVal, float expVal) {
    if (abs(baseVal) < EPS_PRECISION) {
        return 0.0;
    }
    float s = baseVal < 0.0 ? -1.0 : (baseVal > 0.0 ? 1.0 : 0.0);
    return s * pow(abs(baseVal), expVal);
}

float copySign(float magnitude, float signVal) {
    float s = signVal < 0.0 ? -1.0 : (signVal > 0.0 ? 1.0 : 0.0);
    return s * abs(magnitude);
}

float zdiv(float a, float b) {
    return abs(b) < EPS_PRECISION ? 0.0 : a / b;
}

float normalizeAngle360(float deg) {
    return mod(mod(deg, 360.0) + 360.0, 360.0);
}

float normalizeAngleRad(float rad) {
    return mod(mod(rad, TAU) + TAU, TAU);
}

// Hex
vec3 hexToRgb(int hex) {
    float r = float((hex >> 16) & 0xFF) / 255.0;
    float g = float((hex >> 8) & 0xFF) / 255.0;
    float b = float(hex & 0xFF) / 255.0;
    return vec3(r, g, b);
}

int rgbToHex(vec3 rgb) {
    int r = int(clamp(rgb.r, 0.0, 1.0) * 255.0 + 0.5);
    int g = int(clamp(rgb.g, 0.0, 1.0) * 255.0 + 0.5);
    int b = int(clamp(rgb.b, 0.0, 1.0) * 255.0 + 0.5);
    return (r << 16) | (g << 8) | b;
}

// Transfers
float srgbToLinear(float v) {
    return v <= 0.04045 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4);
}

vec3 srgbToLinear(vec3 v) {
    return vec3(srgbToLinear(v.r), srgbToLinear(v.g), srgbToLinear(v.b));
}

float linearToSrgb(float v) {
    return v <= 0.0031308 ? v * 12.92 : 1.055 * pow(v, 1.0 / 2.4) - 0.055;
}

vec3 linearToSrgb(vec3 v) {
    return vec3(linearToSrgb(v.r), linearToSrgb(v.g), linearToSrgb(v.b));
}

float rec709ToLinear(float v) {
    return v <= 0.081 ? v / 4.5 : pow((v + 0.099) / 1.099, 1.0 / 0.45);
}

vec3 rec709ToLinear(vec3 v) {
    return vec3(rec709ToLinear(v.r), rec709ToLinear(v.g), rec709ToLinear(v.b));
}

float linearToRec709(float v) {
    return v <= 0.018 ? 4.5 * v : 1.099 * pow(v, 0.45) - 0.099;
}

vec3 linearToRec709(vec3 v) {
    return vec3(linearToRec709(v.r), linearToRec709(v.g), linearToRec709(v.b));
}

float adobeRgbToLinear(float v) {
    v = clamp(v, 0.0, 1.0);
    return pow(v, 2.19921875);
}

vec3 adobeRgbToLinear(vec3 v) {
    return vec3(adobeRgbToLinear(v.r), adobeRgbToLinear(v.g), adobeRgbToLinear(v.b));
}

float linearToAdobeRgb(float v) {
    v = clamp(v, 0.0, 1.0);
    return spow(v, 1.0 / 2.19921875);
}

vec3 linearToAdobeRgb(vec3 v) {
    return vec3(linearToAdobeRgb(v.r), linearToAdobeRgb(v.g), linearToAdobeRgb(v.b));
}

float prophotoToLinear(float v) {
    return v <= 0.031248 ? v / 16.0 : pow(v, 1.8);
}

vec3 prophotoToLinear(vec3 v) {
    return vec3(prophotoToLinear(v.r), prophotoToLinear(v.g), prophotoToLinear(v.b));
}

float linearToProphoto(float v) {
    return v <= 0.001953 ? v * 16.0 : pow(v, 1.0 / 1.8);
}

vec3 linearToProphoto(vec3 v) {
    return vec3(linearToProphoto(v.r), linearToProphoto(v.g), linearToProphoto(v.b));
}

// XYZ <-> RGB
vec3 linearRgbToXyz(vec3 rgb) {
    return LINEAR_RGB_TO_XYZ_MATRIX * rgb;
}

vec3 xyzToLinearRgb(vec3 xyz) {
    return XYZ_TO_LINEAR_RGB_MATRIX * xyz;
}

vec3 srgbToXyz(vec3 rgb) {
    return linearRgbToXyz(srgbToLinear(rgb));
}

vec3 xyzToSrgb(vec3 xyz) {
    return linearToSrgb(xyzToLinearRgb(xyz));
}

// HLG / PQ
float hlgEncode(float l) {
    float L = max(0.0, min(1.0, l));
    return L <= 1.0 / 12.0 ? sqrt(3.0 * L) : HLG_A * log(12.0 * L - HLG_B) + HLG_C;
}

float hlgDecode(float e) {
    float E = max(0.0, min(1.0, e));
    return E <= 0.5 ? (E * E) / 3.0 : (exp((E - HLG_C) / HLG_A) + HLG_B) / 12.0;
}

float pqEncodeST2084(float L_abs, float exponent) {
    float Lp = max(0.0, L_abs);
    float Lm1 = pow(Lp, PQ_M1);
    float num = PQ_C1 + PQ_C2 * Lm1;
    float den = 1.0 + PQ_C3 * Lm1;

    if (abs(den) < EPS_PRECISION) {
        return 0.0;
    }

    return pow(num / den, exponent);
}

float pqEncodeST2084(float L_abs) {
    return pqEncodeST2084(L_abs, PQ_M2);
}

float pqDecodeST2084(float E, float exponent) {
    float Ep = max(0.0, E);
    float p = pow(Ep, exponent);
    float num = max(p - PQ_C1, 0.0);
    float den = PQ_C2 - PQ_C3 * p;

    if (abs(den) < EPS_PRECISION) {
        return 0.0;
    }

    return pow(num / den, PQ_M1_INV);
}

float pqDecodeST2084(float E) {
    return pqDecodeST2084(E, PQ_M2_INV);
}

// Lab helpers
float fLab(float t) {
    return t > LAB_EPSILON ? pow(t, 1.0 / 3.0) : (LAB_KAPPA * t + 16.0) / 116.0;
}

float fLabInv(float ft) {
    float ft3 = ft * ft * ft;
    return ft3 > LAB_EPSILON ? ft3 : (116.0 * ft - 16.0) / LAB_KAPPA;
}

// HSLuv/HPLuv helpers
void hsLuvBounds(float L, out Line lines[6]) {
    float sub1 = pow(L + 16.0, 3.0) / 1560896.0;
    float sub2 = sub1 > LAB_EPSILON ? sub1 : L / LAB_KAPPA;

    int idx = 0;
    for (int c = 0; c < 3; c++) {
        float m1 = XYZ_TO_LINEAR_RGB_MATRIX[0][c];
        float m2 = XYZ_TO_LINEAR_RGB_MATRIX[1][c];
        float m3 = XYZ_TO_LINEAR_RGB_MATRIX[2][c];

        for (int t = 0; t < 2; t++) {
            float tf = float(t);
            float top1 = (284517.0 * m1 - 94839.0 * m3) * sub2;
            float top2 = (838422.0 * m3 + 769860.0 * m2 + 731718.0 * m1) * L * sub2 - 769860.0 * tf * L;
            float bottom = (632260.0 * m3 - 126452.0 * m2) * sub2 + 126452.0 * tf;

            lines[idx].slope = top1 / bottom;
            lines[idx].intercept = top2 / bottom;
            idx++;
        }
    }
}

// Adaptation
void preAdaptBradford(mat3 M_RGB_TO_XYZ, vec3 srcWP, vec3 dstWP, out mat3 M_adapted, out mat3 M_adapted_inv) {
    vec3 srcLMS = BRADFORD_MATRIX * srcWP;
    vec3 dstLMS = BRADFORD_MATRIX * dstWP;

    float sx = dstLMS.x / srcLMS.x;
    float sy = dstLMS.y / srcLMS.y;
    float sz = dstLMS.z / srcLMS.z;

    mat3 scaleMat = mat3(
        vec3(sx, 0.0, 0.0),
        vec3(0.0, sy, 0.0),
        vec3(0.0, 0.0, sz)
    );

    mat3 SBM = scaleMat * (BRADFORD_MATRIX * M_RGB_TO_XYZ);
    M_adapted = BRADFORD_INV_MATRIX * SBM;
    M_adapted_inv = invert3x3(M_adapted);
}

float camAdaptOne(float v, float fl) {
    float absC = abs(v);

    if (absC < EPS_PRECISION) {
        return 0.0;
    }

    float x = spow(fl * absC * 0.01, CAM_ADAPTED_COEF);

    return (400.0 * copySign(x, v)) / (x + 27.13);
}

float camUnadaptOne(float v, float cns) {
    float cabs = abs(v);

    if (cabs < EPS_PRECISION || cabs >= 400.0) {
        return 0.0;
    }

    return copySign(cns * spow(cabs / (400.0 - cabs), CAM_ADAPTED_COEF_INV), v);
}

vec3 camAdapt(vec3 v, float fl) {
    return vec3(
        camAdaptOne(v.x, fl),
        camAdaptOne(v.y, fl),
        camAdaptOne(v.z, fl)
    );
}

vec3 camUnadapt(vec3 v, float fl) {
    float constant = (100.0 / fl) * pow(27.13, CAM_ADAPTED_COEF_INV);

    return vec3(
        camUnadaptOne(v.x, constant),
        camUnadaptOne(v.y, constant),
        camUnadaptOne(v.z, constant)
    );
}

// OKLab helpers
float okToe(float x) {
    float inner = OK_TOE_K3 * x - OK_TOE_K1;
    return 0.5 * (inner + sqrt(inner * inner + 4.0 * OK_TOE_K2 * OK_TOE_K3 * x));
}

float okToeInv(float x) {
    return (x * x + OK_TOE_K1 * x) / (OK_TOE_K3 * (x + OK_TOE_K2));
}

vec2 okToSt(vec2 cusp) {
    float l = cusp.x;
    float c = cusp.y;
    return vec2(c / l, c / (1.0 - l));
}

float okComputeMaxSaturation(float a, float b) {
    float k0, k1, k2, k3, k4;
    float wl, wm, ws;

    // OK_GAMUT_RGB_COEFFS[0]
    if (-1.8817031 * a - 0.80936501 * b > 1.0) {
        k0 = 1.19086277;
        k1 = 1.76576728;
        k2 = 0.59662641;
        k3 = 0.75515197;
        k4 = 0.56771245;

        wl = LMS_TO_SRGB_LINEAR_MATRIX[0][0];
        wm = LMS_TO_SRGB_LINEAR_MATRIX[1][0];
        ws = LMS_TO_SRGB_LINEAR_MATRIX[2][0];
    }
    // OK_GAMUT_RGB_COEFFS[1]
    else if (1.8144408 * a - 1.19445267 * b > 1.0) {
        k0 = 0.73956515;
        k1 = -0.45954404;
        k2 = 0.08285427;
        k3 = 0.12541073;
        k4 = -0.14503204;

        wl = LMS_TO_SRGB_LINEAR_MATRIX[0][1];
        wm = LMS_TO_SRGB_LINEAR_MATRIX[1][1];
        ws = LMS_TO_SRGB_LINEAR_MATRIX[2][1];
    }
    // OK_GAMUT_RGB_COEFFS[2]
    else {
        k0 = 1.35733652;
        k1 = -0.00915799;
        k2 = -1.1513021;
        k3 = -0.50559606;
        k4 = 0.00692167;

        wl = LMS_TO_SRGB_LINEAR_MATRIX[0][2];
        wm = LMS_TO_SRGB_LINEAR_MATRIX[1][2];
        ws = LMS_TO_SRGB_LINEAR_MATRIX[2][2];
    }

    float sat = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

    float kl = OKLAB_TO_LMS_PRIME_MATRIX[1][0] * a + OKLAB_TO_LMS_PRIME_MATRIX[2][0] * b;
    float km = OKLAB_TO_LMS_PRIME_MATRIX[1][1] * a + OKLAB_TO_LMS_PRIME_MATRIX[2][1] * b;
    float ks = OKLAB_TO_LMS_PRIME_MATRIX[1][2] * a + OKLAB_TO_LMS_PRIME_MATRIX[2][2] * b;

    float l_prime = 1.0 + sat * kl;
    float m_prime = 1.0 + sat * km;
    float s_prime = 1.0 + sat * ks;

    float l = l_prime * l_prime * l_prime;
    float m = m_prime * m_prime * m_prime;
    float s = s_prime * s_prime * s_prime;

    float lds = 3.0 * kl * l_prime * l_prime;
    float mds = 3.0 * km * m_prime * m_prime;
    float sds = 3.0 * ks * s_prime * s_prime;

    float lds2 = 6.0 * kl * kl * l_prime;
    float mds2 = 6.0 * km * km * m_prime;
    float sds2 = 6.0 * ks * ks * s_prime;

    float f = wl * l + wm * m + ws * s;
    float f1 = wl * lds + wm * mds + ws * sds;
    float f2 = wl * lds2 + wm * mds2 + ws * sds2;

    return sat - (f * f1) / (f1 * f1 - 0.5 * f * f2);
}

// ZCAM helpers
float interpScale(float hDeg) {
    float h = hDeg;
    if (h < 42.48) {
        h += 360.0;
    }

    if (h >= 42.48 && h <= 101.808) {
        float t = (h - 42.48) / (101.808 - 42.48);
        return mix(0.98872, 0.895, t);
    }
    if (h >= 101.808 && h <= 132.732) {
        float t = (h - 101.808) / (132.732 - 101.808);
        return mix(0.895, 0.986, t);
    }
    if (h >= 132.732 && h <= 203.832) {
        float t = (h - 132.732) / (203.832 - 132.732);
        return mix(0.986, 1.3557, t);
    }
    if (h >= 203.832 && h <= 258.804) {
        float t = (h - 203.832) / (258.804 - 203.832);
        return mix(1.3557, 1.0658, t);
    }
    if (h >= 258.804 && h <= 320.76) {
        float t = (h - 258.804) / (320.76 - 258.804);
        return mix(1.0658, 1.1586, t);
    }
    if (h >= 320.76 && h <= 402.48) {
        float t = (h - 320.76) / (402.48 - 320.76);
        return mix(1.1586, 0.98872, t);
    }

    return 0.98872;
}

vec3 preAdaptXYZ(vec3 xyz) {
    return vec3(
        PRE_ADAPT_B * xyz.x - (PRE_ADAPT_B - 1.0) * xyz.z,
        PRE_ADAPT_G * xyz.y - (PRE_ADAPT_G - 1.0) * xyz.x,
        xyz.z
    );
}

vec3 undoPreAdaptXYZ(vec3 xyzA) {
    float z = xyzA.z;
    float x = (xyzA.x + (PRE_ADAPT_B - 1.0) * z) / PRE_ADAPT_B;
    float y = (xyzA.y + (PRE_ADAPT_G - 1.0) * x) / PRE_ADAPT_G;
    return vec3(x, y, z);
}

vec3 adaptTwoStage(vec3 xyzB, vec3 xyzWb, vec3 xyzWd, float dB, float dD, vec3 xyzWo) {
    if (
        abs(dB - dD) < EPS_PRECISION &&
        abs(xyzWb.x - xyzWd.x) < EPS_PRECISION &&
        abs(xyzWb.y - xyzWd.y) < EPS_PRECISION &&
        abs(xyzWb.z - xyzWd.z) < EPS_PRECISION
    ) {
        return xyzB;
    }

    float yb = xyzWb.y / xyzWo.y;
    float yd = xyzWd.y / xyzWo.y;

    vec3 vB = CAT02_MATRIX * xyzB;
    vec3 vWb = CAT02_MATRIX * xyzWb;
    vec3 vWd = CAT02_MATRIX * xyzWd;
    vec3 vWo = CAT02_MATRIX * xyzWo;

    float dRgbWb0 = dB * yb * (vWo.x / vWb.x) + (1.0 - dB);
    float dRgbWb1 = dB * yb * (vWo.y / vWb.y) + (1.0 - dB);
    float dRgbWb2 = dB * yb * (vWo.z / vWb.z) + (1.0 - dB);

    float dRgbWd0 = dD * yd * (vWo.x / vWd.x) + (1.0 - dD);
    float dRgbWd1 = dD * yd * (vWo.y / vWd.y) + (1.0 - dD);
    float dRgbWd2 = dD * yd * (vWo.z / vWd.z) + (1.0 - dD);

    float s0 = dRgbWb0 / dRgbWd0;
    float s1 = dRgbWb1 / dRgbWd1;
    float s2 = dRgbWb2 / dRgbWd2;

    return CAT02_INV_MATRIX * (vec3(s0, s1, s2) * vB);
}

float computeFL(float la) {
    return 0.171 * pow(la, 1.0 / 3.0) * (1.0 - exp((-48.0 / 9.0) * la));
}

float degreeOfAdaptation(float la, float F) {
    float d = F * (1.0 - (1.0 / 3.6) * exp((-la - 42.0) / 92.0));
    return clamp(d, 0.0, 1.0);
}

vec3 xyzToIzAzBz(vec3 xyz, vec3 wp, float dAdapt) {
    vec3 outVal = adaptTwoStage(xyz, wp, wp, dAdapt, dAdapt, WHITEPOINT_E);
    outVal = preAdaptXYZ(outVal);
    outVal = XYZ_TO_CONE_JZAZBZ_MATRIX * outVal;

    float lmsScaled0 = pqEncodeST2084(outVal.x * PQ_LUMINANCE_SCALE, PQ_P);
    float lmsScaled1 = pqEncodeST2084(outVal.y * PQ_LUMINANCE_SCALE, PQ_P);
    float lmsScaled2 = pqEncodeST2084(outVal.z * PQ_LUMINANCE_SCALE, PQ_P);

    return LMSP_TO_IZAZBZ * vec3(lmsScaled0, lmsScaled1, lmsScaled2);
}