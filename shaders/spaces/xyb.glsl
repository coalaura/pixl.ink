const float XYB_BIAS = 0.0037930732552754493;
const float XYB_BIAS_CBRT = 0.15595420054924863;

const float XYB_X_RANGE = 0.05;
const float XYB_Y_MAX = 0.845;
const float XYB_B_RANGE = 0.45;

const mat3 XYB_LRGB_TO_LMS_MATRIX = mat3(
	vec3(0.3, 0.23, 0.2434226892454782),
	vec3(0.622, 0.692, 0.2047674442449682),
	vec3(0.078, 0.078, 0.5518098665095535)
);

const mat3 XYB_LMS_TO_LRGB_MATRIX = mat3(
	vec3(11.031566904639861, -3.2541473810744237, -3.65885128671368),
	vec3(-9.866943908131564, 4.418770377582723, 2.712923045936092),
	vec3(-0.1646229965082993, -0.1646229965082993, 1.9459282407775889)
);

const mat3 XYB_LMS_TO_XYB_MATRIX = mat3(
	vec3(0.5, 0.5, 0.0),
	vec3(-0.5, 0.5, 0.0),
	vec3(0.0, 0.0, 1.0)
);

const mat3 XYB_TO_XYB_LMS_MATRIX = mat3(
	vec3(1.0, -1.0, 0.0),
	vec3(1.0, 1.0, 0.0),
	vec3(0.0, 0.0, 1.0)
);

vec3 rgbLinearToXYB(vec3 rgbLinear) {
    vec3 lms = XYB_LRGB_TO_LMS_MATRIX * rgbLinear;

    vec3 biased_lms = vec3(
        spow(lms.x + XYB_BIAS, 1.0 / 3.0) - XYB_BIAS_CBRT,
        spow(lms.y + XYB_BIAS, 1.0 / 3.0) - XYB_BIAS_CBRT,
        spow(lms.z + XYB_BIAS, 1.0 / 3.0) - XYB_BIAS_CBRT
    );

    vec3 xyb = XYB_LMS_TO_XYB_MATRIX * biased_lms;
    xyb.z -= xyb.y;

    return xyb;
}

vec3 xybToRgbLinear(vec3 xyb) {
    if (abs(xyb.x) < EPS_PRECISION && abs(xyb.y) < EPS_PRECISION && abs(xyb.z) < EPS_PRECISION) {
        return vec3(0.0);
    }

    vec3 xyb_lms = XYB_TO_XYB_LMS_MATRIX * vec3(xyb.x, xyb.y, xyb.z + xyb.y);

    vec3 term = xyb_lms + vec3(XYB_BIAS_CBRT);
    vec3 lms = term * term * term - vec3(XYB_BIAS);

    return XYB_LMS_TO_LRGB_MATRIX * lms;
}

vec3 xyb_to_xyz(vec3 xyb) {
    float X = (xyb.x - 0.5) * (2.0 * XYB_X_RANGE);
    float Y = xyb.y * XYB_Y_MAX;
    float B = (xyb.z - 0.5) * (2.0 * XYB_B_RANGE);

    vec3 rgbLinear = xybToRgbLinear(vec3(X, Y, B));
    return linearRgbToXyz(rgbLinear);
}

vec3 xyz_to_xyb(vec3 xyz) {
    vec3 rgbLinear = xyzToLinearRgb(xyz);
    vec3 xyb = rgbLinearToXYB(rgbLinear);

    float x_n = xyb.x / (2.0 * XYB_X_RANGE) + 0.5;
    float y_n = xyb.y / XYB_Y_MAX;
    float b_n = xyb.z / (2.0 * XYB_B_RANGE) + 0.5;

    return vec3(
        clamp_skip(x_n, 0.0, 1.0, u_clamped == 0),
        clamp_skip(y_n, 0.0, 1.0, u_clamped == 0),
        clamp_skip(b_n, 0.0, 1.0, u_clamped == 0)
    );
}
