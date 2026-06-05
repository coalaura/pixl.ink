const float SMPTE240M_LINEAR_THRESHOLD = 0.0228;
const float SMPTE240M_ENCODED_THRESHOLD = 0.0912;

const mat3 SMPTE240M_TO_XYZ_MATRIX = mat3(
    vec3(0.393559, 0.212376, 0.018738),
    vec3(0.365254, 0.701060, 0.111934),
    vec3(0.191615, 0.086564, 0.958228)
);

const mat3 XYZ_TO_SMPTE240M_MATRIX = mat3(
    vec3(3.505103, -1.068769, 0.056307),
    vec3(-1.739348, 1.977469, -0.196986),
    vec3(-0.543782, 0.035078, 1.050002)
);

vec3 smpte240m_to_linear(vec3 v) {
    vec3 linear;
    linear.r = (v.r <= SMPTE240M_ENCODED_THRESHOLD) ? (v.r / 4.0) : pow((v.r + 0.1115) / 1.1115, 2.2222222222222223);
    linear.g = (v.g <= SMPTE240M_ENCODED_THRESHOLD) ? (v.g / 4.0) : pow((v.g + 0.1115) / 1.1115, 2.2222222222222223);
    linear.b = (v.b <= SMPTE240M_ENCODED_THRESHOLD) ? (v.b / 4.0) : pow((v.b + 0.1115) / 1.1115, 2.2222222222222223);
    return linear;
}

vec3 linear_to_smpte240m(vec3 v) {
    vec3 encoded;
    encoded.r = (v.r <= SMPTE240M_LINEAR_THRESHOLD) ? (4.0 * v.r) : (1.1115 * pow(max(0.0, v.r), 0.45) - 0.1115);
    encoded.g = (v.g <= SMPTE240M_LINEAR_THRESHOLD) ? (4.0 * v.g) : (1.1115 * pow(max(0.0, v.g), 0.45) - 0.1115);
    encoded.b = (v.b <= SMPTE240M_LINEAR_THRESHOLD) ? (4.0 * v.b) : (1.1115 * pow(max(0.0, v.b), 0.45) - 0.1115);
    return encoded;
}

vec3 smpte240m_to_xyz(vec3 rgb) {
    vec3 rLinear = smpte240m_to_linear(rgb);
    return SMPTE240M_TO_XYZ_MATRIX * rLinear;
}

vec3 xyz_to_smpte240m(vec3 xyz) {
    vec3 rgbLinear = XYZ_TO_SMPTE240M_MATRIX * xyz;
    vec3 encoded = linear_to_smpte240m(rgbLinear);
    return clamp_skip(encoded, 0.0, 1.0, u_clamped == 0);
}