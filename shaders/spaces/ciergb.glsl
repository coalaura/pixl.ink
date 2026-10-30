float cieRgbToLinear(float v) {
    return spow(v, 2.2);
}

vec3 cieRgbToLinear(vec3 v) {
    return vec3(cieRgbToLinear(v.r), cieRgbToLinear(v.g), cieRgbToLinear(v.b));
}

float linearToCieRgb(float v) {
    return spow(v, 1.0 / 2.2);
}

vec3 linearToCieRgb(vec3 v) {
    return vec3(linearToCieRgb(v.r), linearToCieRgb(v.g), linearToCieRgb(v.b));
}

vec3 ciergb_to_xyz(vec3 rgb) {
    const mat3 CIERGB_TO_XYZ_MATRIX = mat3(
	vec3(0.4621624680235555, 0.16321675498025143, 0.0007366499396997267),
	vec3(0.2740573680127885, 0.8241698969213701, 0.009229170988579678),
	vec3(0.21393485781902083, 0.012613348098378677, 1.0782932467439685)
);

    vec3 rgbLin = cieRgbToLinear(rgb);
    return CIERGB_TO_XYZ_MATRIX * rgbLin;
}

vec3 xyz_to_ciergb(vec3 xyz) {
    const mat3 XYZ_TO_CIERGB_MATRIX = mat3(
	vec3(2.4503737025782097, -0.4853044543118042, 0.002479743018136376),
	vec3(-0.8094733000568357, 1.3738198272034416, -0.011205597059586453),
	vec3(-0.476688676950069, 0.08021479499045714, 0.927030601039922)
);

    vec3 v3 = XYZ_TO_CIERGB_MATRIX * xyz;
    return linearToCieRgb(v3);
}
