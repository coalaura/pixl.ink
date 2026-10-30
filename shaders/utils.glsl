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
const float EPS_PERCEPTUAL = 0.001;

const float TAU = 6.283185307179586;
const float RAD2DEG = 57.29577951308232;
const float DEG2RAD = 0.017453292519943295;

// Whitepoints
const vec3 WHITEPOINT_C = vec3(0.980705971659919, 1.0, 1.1822494939271255);
const vec3 WHITEPOINT_D50 = vec3(0.9639061644994781, 1.0, 0.824746120046449);
const vec3 WHITEPOINT_D60 = vec3(0.9523181805192729, 1.0, 1.0080277586741835);
const vec3 WHITEPOINT_D65 = vec3(0.9501546938553648, 1.0, 1.0882590676722474);
const vec3 WHITEPOINT_E = vec3(1.0, 1.0, 1.0000000000000004);

// Matrices
const mat3 BRADFORD_MATRIX = mat3(
	vec3(0.8951, -0.7502, 0.0389),
	vec3(0.2664, 1.7135, -0.0685),
	vec3(-0.1614, 0.0367, 1.0296)
);

const mat3 BRADFORD_INV_MATRIX = mat3(
	vec3(0.9869929054667123, 0.43230526972339456, -0.008528664575177328),
	vec3(-0.14705425642099013, 0.5183602715367776, 0.04004282165408487),
	vec3(0.15996265166373125, 0.0492912282128556, 0.9684866957875502)
);

const mat3 CAT02_MATRIX = mat3(
	vec3(0.7328, -0.7036, 0.003),
	vec3(0.4296, 1.6975, 0.0136),
	vec3(-0.1624, 0.0061, 0.9834)
);

const mat3 CAT02_INV_MATRIX = mat3(
	vec3(1.096123820835514, 0.45436904197535916, -0.009627608738429352),
	vec3(-0.2788690002182872, 0.4735331543074117, -0.005698031216113419),
	vec3(0.18274517938277304, 0.0720978037172291, 1.0153256399545425)
);

const mat3 CAT16_MATRIX = mat3(
	vec3(0.401288, -0.250268, -0.002079),
	vec3(0.650173, 1.204414, 0.048952),
	vec3(-0.051461, 0.045854, 0.953127)
);

const mat3 CAT16_INV_MATRIX = mat3(
	vec3(1.8620678550872327, 0.3875265432361371, -0.015841498849333856),
	vec3(-1.0112546305316843, 0.6214474419314753, -0.03412293802851556),
	vec3(0.14918677544445172, -0.00897398516761252, 1.0499644368778493)
);

const mat3 M1_MATRIX = mat3(
	vec3(460.0, 460.0, 460.0),
	vec3(451.0, -891.0, -220.0),
	vec3(288.0, -261.0, -6300.0)
);

const mat3 REC2020_TO_XYZ_MATRIX = mat3(
	vec3(0.6367575638699456, 0.262617526341842, 4.99253466463727e-17),
	vec3(0.14464412531584167, 0.6781256933925047, 0.028077977267192723),
	vec3(0.16875300466957738, 0.05925678026565312, 1.0601810904050546)
);

const mat3 XYZ_TO_REC2020_MATRIX = mat3(
	vec3(1.717191679135829, -0.6665588831960222, 0.01765323428139307),
	vec3(-0.35578276745570414, 1.6161770181602182, -0.04280304750419981),
	vec3(-0.2534460542695398, 0.0157655782057216, 0.9428175464548638)
);

const mat3 AP1_TO_XYZ_MATRIX = mat3(
	vec3(0.6520242582810264, 0.2675854174513303, -0.005379946879341543),
	vec3(0.1282717091765147, 0.6744694183201955, 0.0013660168326595223),
	vec3(0.1698587263978241, 0.05794516422847441, 1.0922729977189296)
);

const mat3 XYZ_TO_AP1_MATRIX = mat3(
	vec3(1.6611414971251173, -0.6598062772947694, 0.009007051822417842),
	vec3(-0.31542934017383134, 1.6080949292979787, -0.003564747864671076),
	vec3(-0.24158957943708034, 0.017296526781203362, 0.9143104660052046)
);

const mat3 CONE_TO_XYZ_JZAZBZ_MATRIX = mat3(
	vec3(1.9242264357876067, 0.3503167620949991, -0.0909828109828475),
	vec3(-1.0047923125953657, 0.7264811939316552, -0.3127282905230739),
	vec3(0.037651404030618, -0.065384422948085, 1.5227665613052603)
);

const mat3 XYZ_TO_CONE_JZAZBZ_MATRIX = mat3(
	vec3(0.41478972, -0.20151000000000002, -0.01660080000000002),
	vec3(0.5799990000000002, 1.120649, 0.2647999999999999),
	vec3(0.014647999999999996, 0.05310079999999998, 0.6684799)
);

const mat3 OKLAB_TO_LMS_PRIME_MATRIX = mat3(
	vec3(1.0, 1.0, 1.0),
	vec3(0.3963377774, -0.1055613458, -0.0894841775),
	vec3(0.2158037573, -0.0638541728, -1.291485548)
);

const mat3 LMS_PRIME_TO_OKLAB_MATRIX = mat3(
	vec3(0.21045426827458125, 1.9779985323885083, 0.025904042487658183),
	vec3(0.7936177747300267, -2.428592241936286, 0.7827717124269177),
	vec3(-0.004072043004608028, 0.45059370954777794, -0.8086757549145759)
);

const mat3 OKLAB_LMS_TO_XYZ_MATRIX = mat3(
	vec3(1.2257913189783185, -0.04131133673940574, -0.0764541826058516),
	vec3(-0.5566756915467337, 1.1132200873455174, -0.42080022744343926),
	vec3(0.28103906642378, -0.07190875060611186, 1.5855134777215383)
);

const mat3 OKLAB_XYZ_TO_LMS_MATRIX = mat3(
	vec3(0.8199321198385009, 0.03355671353512803, 0.0484435571072841),
	vec3(0.36127036620483, 0.9287491913355538, 0.26391355695136387),
	vec3(-0.12895157291207177, 0.036174051710765015, 0.6340931037240165)
);

const mat3 LMS_TO_SRGB_LINEAR_MATRIX = mat3(
	vec3(4.076741636075958, -1.2684379732850315, -0.0041960761386756),
	vec3(-3.307711539258063, 2.609757349287688, -0.7034186179359362),
	vec3(0.2309699031821043, -0.341319376002657, 1.7076146940746117)
);

const mat3 LINEAR_RGB_TO_XYZ_MATRIX = mat3(
	vec3(0.4121524143918863, 0.21251608867081637, 0.01931964442461965),
	vec3(0.35767687471487014, 0.7153537494297403, 0.11922562490495668),
	vec3(0.18032540474860842, 0.07213016189944337, 0.9497137983426711)
);

const mat3 XYZ_TO_LINEAR_RGB_MATRIX = mat3(
	vec3(3.242844486816786, -0.9689928812362132, 0.05567801528890104),
	vec3(-1.5382723847720652, 1.875482166038882, -0.20415272272597032),
	vec3(-0.49889915181796707, 0.041544306611517826, 1.057882290489119)
);

const mat3 LMS_TO_XYZ_HPE_MATRIX = mat3(
	vec3(1.9101968341704305, 0.370950088249105, 0.0),
	vec3(-1.1121238620490024, 0.6290541866113667, 0.0),
	vec3(0.2019072850149422, -0.0000018248604712, 1.0)
);

const mat3 XYZ_TO_LMS_HPE_MATRIX = mat3(
	vec3(0.38970999152774394, -0.22981002086245778, 0.0),
	vec3(0.6889800435024832, 1.1834001075026475, 0.0),
	vec3(-0.07868402904011608, 0.04640247692164386, 1.0)
);

const mat3 XYZ_TO_LMS_2006_MATRIX = mat3(
	vec3(0.185082982238733, -0.134433056469973, 0.000789456671966863),
	vec3(0.584081279463687, 0.405752392775348, -0.000912281325916184),
	vec3(-0.0240722415044404, 0.0358252602217631, 0.0198490812339463)
);

const mat3 LMS_2006_TO_XYZ_MATRIX = mat3(
	vec3(2.6284747739476875, 0.8765342837340054, -0.06425592569153737),
	vec3(-3.761263499279893, 1.2003038085515867, 0.20476359921126536),
	vec3(9.9763571339745, -1.1033785928646218, 49.93266413348867)
);

const mat3 LMS_TO_XYZ_BT2100_IPT_MATRIX = mat3(
	vec3(2.0701522183894223, 0.3647385209748072, -0.0497472075358123),
	vec3(-1.3263473389671563, 0.6805660249472273, -0.0492609666966131),
	vec3(0.2066510476294053, -0.0453045459220347, 1.1880659249923042)
);

const mat3 XYZ_TO_LMS_BT2100_IPT_MATRIX = mat3(
	vec3(0.3592832590121217, -0.19208084637049933, 0.007079784460747904),
	vec3(0.6976051147779502, 1.100476797037432, 0.07483966621863614),
	vec3(-0.035891593232028944, 0.07537486585191189, 0.8433265453898764)
);

const mat3 LMS_TO_IPT_BT2100_MATRIX = mat3(
	vec3(0.5, 1.61376953125, 4.378173828125),
	vec3(0.5, -3.323486328125, -4.24560546875),
	vec3(0.0, 1.709716796875, -0.132568359375)
);

const mat3 IPT_TO_LMS_BT2100_MATRIX = mat3(
	vec3(1.0, 1.0, 1.0),
	vec3(0.008609037037932758, -0.008609037037932758, 0.5600313357106792),
	vec3(0.11102962500302596, -0.11102962500302596, -0.32062717498731885)
);

const mat3 LMSP_TO_IZAZBZ = mat3(
	vec3(0.0, 3.524, 0.199076),
	vec3(1.0, -4.066708, 1.096799),
	vec3(0.0, 0.542708, -1.295875)
);

const mat3 IZAZBZ_TO_LMSP = mat3(
	vec3(1.0000000000000002, 1.0, 1.0),
	vec3(0.2772100865430786, 0.0, 0.042585801245220344),
	vec3(0.11609463231223774, 0.0, -0.75384457989992)
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
const float CAM_ADAPTED_COEF_INV = 2.380952380952381;

const float CAM_UCS_K = 1.7;
const float CAM_UCS_C1 = 0.007;
const float CAM_UCS_C2 = 0.0228;

const float LAB_EPSILON = 0.008856451679035631;
const float LAB_KAPPA = 903.2962962962963;

const float OK_TOE_K1 = 0.206;
const float OK_TOE_K2 = 0.03;
const float OK_TOE_K3 = 1.170873786407767;

const float HLG_A = 0.17883277;
const float HLG_B = 0.28466892;
const float HLG_C = 0.55991073;

const float PRE_ADAPT_B = 1.15;
const float PRE_ADAPT_G = 0.66;

const float PQ_M1 = 0.1593017578125;
const float PQ_M1_INV = 6.277394636015326;

const float PQ_M2 = 78.84375;
const float PQ_M2_INV = 0.012683313515655966;

const float PQ_C1 = 0.8359375;
const float PQ_C2 = 18.8515625;
const float PQ_C3 = 18.6875;

const float PQ_P = 134.034375;
const float PQ_P_INV = 0.007460772656268214;

const float PQ_MAX_LUMINANCE = 10000.0;
const float HDR_REFERENCE_WHITE_NITS = 203.0;
const float PQ_LUMINANCE_SCALE = 0.0203;

const float IZ_OFFSET = 3.7035226210190005e-11;

const float VSLOG3_CUT1 = 0.01125;
const float VSLOG3_LOG_CUT = 0.16736099187966763;
const float VSLOG3_F = 0.09286412512218964;
const float VSLOG3_E = 6.621943711775821;

const float CAM02_LCD_C1 = 0.007;
const float CAM02_LCD_C2 = 0.0053;

const float CAM02_SCD_C1 = 0.007;
const float CAM02_SCD_C2 = 0.0363;

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
    mat3 toXYZ;
    mat3 fromXYZ;
    mat3 toRGB;
};

struct AdaptedLabParams {
    mat3 toXYZ;
    mat3 fromXYZ;
};

struct HunterParams {
    vec3 wp;
    float KA;
    float KB;
    mat3 toXYZ;
    mat3 fromXYZ;
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
    float M_FACTOR;
    float PQ_SCALE;
    mat3 toModel;
    mat3 fromModel;
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
        if (name == WP_D50) return xyToXyzY1(calculateDaylight_xy(5503.0));
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
    return spow(v, 2.19921875);
}

vec3 adobeRgbToLinear(vec3 v) {
    return vec3(adobeRgbToLinear(v.r), adobeRgbToLinear(v.g), adobeRgbToLinear(v.b));
}

float linearToAdobeRgb(float v) {
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

float vsLog3ToLinear(float v) {
    return v >= VSLOG3_LOG_CUT ? pow(10.0, (1023.0 * v - 420.0) / 261.5) * 0.19 - 0.01 : (v - VSLOG3_F) / VSLOG3_E;
}

vec3 vsLog3ToLinear(vec3 v) {
    return vec3(vsLog3ToLinear(v.r), vsLog3ToLinear(v.g), vsLog3ToLinear(v.b));
}

float linearToVSLog3(float v) {
    return v >= VSLOG3_CUT1 ? (420.0 + 261.5 * log((v + 0.01) / 0.19) / log(10.0)) / 1023.0 : VSLOG3_E * v + VSLOG3_F;
}

vec3 linearToVSLog3(vec3 v) {
    return vec3(linearToVSLog3(v.r), linearToVSLog3(v.g), linearToVSLog3(v.b));
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
    float L = abs(l);
    return sign(l) * (L <= 1.0 / 12.0 ? sqrt(3.0 * L) : HLG_A * log(12.0 * L - HLG_B) + HLG_C);
}

float hlgDecode(float e) {
    float E = abs(e);
    return sign(e) * (E <= 0.5 ? (E * E) / 3.0 : (exp((E - HLG_C) / HLG_A) + HLG_B) / 12.0);
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
void hsLuvBounds(float L, LabParams params, out Line lines[6]) {
    float sub1 = pow(L + 16.0, 3.0) / 1560896.0;
    float sub2 = sub1 > LAB_EPSILON ? sub1 : L / LAB_KAPPA;
    float denom = params.wp.x + 15.0 * params.wp.y + 3.0 * params.wp.z;
    float un = 4.0 * params.wp.x / denom;
    float vn = 9.0 * params.wp.y / denom;
    mat3 toRGB = transpose(params.toRGB);

    int idx = 0;
    for (int c = 0; c < 3; c++) {
        float m1 = toRGB[0][c];
        float m2 = toRGB[1][c];
        float m3 = toRGB[2][c];

        for (int t = 0; t < 2; t++) {
            float tf = float(t);
            float first = sub2 * (9.0 * m1 - 3.0 * m3);
            float second = sub2 * (4.0 * m2 - 20.0 * m3) - 4.0 * tf;
            float constantTerm = 12.0 * sub2 * m3;

            lines[idx].slope = -first / second;
            lines[idx].intercept = -13.0 * L * (first * un + second * vn + constantTerm) / second;
            idx++;
        }
    }
}

// Adaptation
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

vec3 xyzToIzAzBz(vec3 xyz, ZcamParams params) {
    vec3 outVal = transpose(params.toModel) * xyz;
    outVal = preAdaptXYZ(outVal);
    outVal = XYZ_TO_CONE_JZAZBZ_MATRIX * outVal;

    float lmsScaled0 = pqEncodeST2084(outVal.x * params.PQ_SCALE, PQ_P);
    float lmsScaled1 = pqEncodeST2084(outVal.y * params.PQ_SCALE, PQ_P);
    float lmsScaled2 = pqEncodeST2084(outVal.z * params.PQ_SCALE, PQ_P);

    return LMSP_TO_IZAZBZ * vec3(lmsScaled0, lmsScaled1, lmsScaled2);
}
