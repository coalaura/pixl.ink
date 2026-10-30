// IEC 61966-2-4 xvYCC (extended BT.709, studio-range Y'CbCr).
const float XVYCC_CB_SCALE = 1.8556;
const float XVYCC_CR_SCALE = 1.5748;

vec3 xvycc_to_xyz(vec3 ycc) {
    float Yp = (255.0 * ycc.x - 16.0) / 219.0;
    float Cb = (255.0 * ycc.y - 128.0) / 224.0;
    float Cr = (255.0 * ycc.z - 128.0) / 224.0;

    float rPrime = Yp + XVYCC_CR_SCALE * Cr;
    float bPrime = Yp + XVYCC_CB_SCALE * Cb;
    float gPrime = (Yp - LUMA_BT709_KR * rPrime - LUMA_BT709_KB * bPrime) / LUMA_BT709_KG;

    vec3 rgb = vec3(rPrime, gPrime, bPrime);
    vec3 linear = vec3(rec709ToLinear(abs(rgb.r)), rec709ToLinear(abs(rgb.g)), rec709ToLinear(abs(rgb.b)));
    return LINEAR_RGB_TO_XYZ_MATRIX * (sign(rgb) * linear);
}

vec3 xyz_to_xvycc(vec3 xyz) {
    vec3 linear = XYZ_TO_LINEAR_RGB_MATRIX * xyz;
    vec3 rgb = sign(linear) * vec3(linearToRec709(abs(linear.r)), linearToRec709(abs(linear.g)), linearToRec709(abs(linear.b)));

    float Yp = LUMA_BT709_KR * rgb.r + LUMA_BT709_KG * rgb.g + LUMA_BT709_KB * rgb.b;
    float Cb = (rgb.b - Yp) / XVYCC_CB_SCALE;
    float Cr = (rgb.r - Yp) / XVYCC_CR_SCALE;

    float Y_out = (16.0 + 219.0 * Yp) / 255.0;
    float Cb_out = (128.0 + 224.0 * Cb) / 255.0;
    float Cr_out = (128.0 + 224.0 * Cr) / 255.0;

    return vec3(
        clamp_skip(Y_out, 0.0, 1.0, u_clamped == 0),
        clamp_skip(Cb_out, 0.0, 1.0, u_clamped == 0),
        clamp_skip(Cr_out, 0.0, 1.0, u_clamped == 0)
    );
}
