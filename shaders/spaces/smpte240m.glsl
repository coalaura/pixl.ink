const float SMPTE240M_LINEAR_THRESHOLD = 0.0228;
const float SMPTE240M_ENCODED_THRESHOLD = 0.0912;

const mat3 SMPTE240M_TO_XYZ_MATRIX = mat3(
	vec3(0.3932762932546391, 0.2122443487405989, 0.018727442535935175),
	vec3(0.3653654413325555, 0.7012659277189371, 0.11196682879546052),
	vec3(0.1915129592681703, 0.08648972354046403, 0.9575647963408516)
);

const mat3 XYZ_TO_SMPTE240M_MATRIX = mat3(
	vec3(3.508183950353893, -1.068733414434887, 0.056354805557270876),
	vec3(-1.7408728431785285, 1.9771977016859654, -0.19714431978685396),
	vec3(-0.5443966622998146, 0.03516108402501921, 1.0508513742149914)
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