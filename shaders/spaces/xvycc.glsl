// IEC 61966-2-4 xvYCC (BT.709 luma, studio-range Y'CbCr; sRGB-coded R'G'B')
const float XVYCC_CB_SCALE = 2.0 * (1.0 - LUMA_BT709_KB);
const float XVYCC_CR_SCALE = 2.0 * (1.0 - LUMA_BT709_KR);

vec3 xvycc_to_xyz(vec3 ycc) {
    float Yp = (255.0 * ycc.x - 16.0) / 219.0;
    float Cb = (255.0 * ycc.y - 128.0) / 224.0;
    float Cr = (255.0 * ycc.z - 128.0) / 224.0;

    float rPrime = Yp + XVYCC_CR_SCALE * Cr;
    float bPrime = Yp + XVYCC_CB_SCALE * Cb;
    float gPrime = (Yp - LUMA_BT709_KR * rPrime - LUMA_BT709_KB * bPrime) / LUMA_BT709_KG;

    return srgbToXyz(vec3(rPrime, gPrime, bPrime));
}

vec3 xyz_to_xvycc(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    float Yp = LUMA_BT709_KR * rgb.r + LUMA_BT709_KG * rgb.g + LUMA_BT709_KB * rgb.b;
    float Cb = (rgb.b - Yp) / XVYCC_CB_SCALE;
    float Cr = (rgb.r - Yp) / XVYCC_CR_SCALE;

    float Y_out = (16.0 + 219.0 * Yp) / 255.0;
    float Cb_out = (128.0 + 224.0 * Cb) / 255.0;
    float Cr_out = (128.0 + 224.0 * Cr) / 255.0;

    return vec3(
        clamp(Y_out, 0.0, 1.0),
        clamp(Cb_out, 0.0, 1.0),
        clamp(Cr_out, 0.0, 1.0)
    );
}