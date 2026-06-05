out vec4 fragColor;
in vec2 v_texCoord;

const mat3 M_PROTANOPIA = mat3(
    0.56667, 0.55833, 0.0,
    0.43333, 0.44167, 0.24167,
    0.0, 0.0, 0.75833
);

const mat3 M_DEUTERANOPIA = mat3(
    0.625, 0.0, 0.0,
    0.375, 0.7, 0.3,
    0.0, 0.3, 0.7
);

const mat3 M_TRITANOPIA = mat3(
    0.95, 0.0, 0.0,
    0.05, 0.43333, 0.475,
    0.0, 0.56667, 0.525
);

const mat3 RGBL_TO_XYZ = mat3(
    0.412390799266, 0.212639005872, 0.019330818716,
    0.357584339384, 0.715168678768, 0.119194779795,
    0.180480788402, 0.072192315361, 0.95053215225
);

const mat3 XYZ_TO_LMS = mat3(
    0.4002, -0.228, 0.0,
    0.7075, 1.15, 0.0,
    -0.0807, 0.0612, 0.9184
);

const mat3 LMS_TO_XYZ = mat3(
    1.850242944943, 0.366830775171, 0.0,
    -1.138301637867, 0.64388454484, 0.0,
    0.238434958509, -0.010673443584, 1.088850174216
);

const mat3 XYZ_TO_RGBL = mat3(
    3.240969941905, -0.969243636281, 0.055630079697,
    -1.53738317757, 1.875967501508, -0.203976958889,
    -0.498610760293, 0.041555057407, 1.056971514243
);

vec3 achromatopsia(vec3 rgb) {
    float gray = dot(rgb, vec3(LUMA_BT709_KR, LUMA_BT709_KG, LUMA_BT709_KB));
    return vec3(gray);
}

vec3 blueConeMonochromacy(vec3 rgb) {
    vec3 xyz = RGBL_TO_XYZ * rgb;
    vec3 lms = XYZ_TO_LMS * xyz;
    vec3 lms_new = vec3(0.0, 0.0, lms.z);
    vec3 xyz_new = LMS_TO_XYZ * lms_new;
    return XYZ_TO_RGBL * xyz_new;
}

vec3 lConeMonochromacy(vec3 rgb) {
    vec3 xyz = RGBL_TO_XYZ * rgb;
    vec3 lms = XYZ_TO_LMS * xyz;
    vec3 lms_new = vec3(lms.x, 0.0, 0.0);
    vec3 xyz_new = LMS_TO_XYZ * lms_new;
    return XYZ_TO_RGBL * xyz_new;
}

vec3 mConeMonochromacy(vec3 rgb) {
    vec3 xyz = RGBL_TO_XYZ * rgb;
    vec3 lms = XYZ_TO_LMS * xyz;
    vec3 lms_new = vec3(0.0, lms.y, 0.0);
    vec3 xyz_new = LMS_TO_XYZ * lms_new;
    return XYZ_TO_RGBL * xyz_new;
}

vec3 simulateCvd(vec3 rgb, int mode) {
    if (mode == 0) return rgb;

    vec3 lin = srgbToLinear(rgb);
    vec3 outLin = lin;

    if (mode == 1) { // protanopia
        outLin = M_PROTANOPIA * lin;
    } else if (mode == 2) { // protanomaly
        outLin = mix(lin, M_PROTANOPIA * lin, 0.5);
    } else if (mode == 3) { // deuteranopia
        outLin = M_DEUTERANOPIA * lin;
    } else if (mode == 4) { // deuteranomaly
        outLin = mix(lin, M_DEUTERANOPIA * lin, 0.5);
    } else if (mode == 5) { // tritanopia
        outLin = M_TRITANOPIA * lin;
    } else if (mode == 6) { // tritanomaly
        outLin = mix(lin, M_TRITANOPIA * lin, 0.5);
    } else if (mode == 7) { // achromatopsia
        outLin = achromatopsia(lin);
    } else if (mode == 8) { // achromatomaly
        outLin = mix(lin, achromatopsia(lin), 0.5);
    } else if (mode == 9) { // s_cone_monochromacy
        outLin = blueConeMonochromacy(lin);
    } else if (mode == 10) { // l_cone_monochromacy
        outLin = lConeMonochromacy(lin);
    } else if (mode == 11) { // m_cone_monochromacy
        outLin = mConeMonochromacy(lin);
    }

    return linearToSrgb(outLin);
}

void main() {
    vec3 color = u_constant_color;
    
    // Map texture coordinates to designated axis slots
    if (u_xAxis_idx == 0) color.r = v_texCoord.x;
    else if (u_xAxis_idx == 1) color.g = v_texCoord.x;
    else if (u_xAxis_idx == 2) color.b = v_texCoord.x;

    if (u_yAxis_idx == 0) color.r = v_texCoord.y;
    else if (u_yAxis_idx == 1) color.g = v_texCoord.y;
    else if (u_yAxis_idx == 2) color.b = v_texCoord.y;

    vec3 xyz = space_to_xyz(color);
    vec3 rgb = xyzToSrgb(xyz);

    float lo = -0.001;
    float hi = 1.001;
    bool inRange = rgb.r >= lo && rgb.r <= hi && rgb.g >= lo && rgb.g <= hi && rgb.b >= lo && rgb.b <= hi;

    if (!inRange && u_clamped == 2) {
        fragColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }

    if (u_clamped == 1 && !inRange) {
        rgb /= 1.75;
    }

    rgb = simulateCvd(rgb, u_cvdMode);
    fragColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
}