const mat3 ERIMM_TO_XYZ_MATRIX = mat3(
	vec3(0.7554758356610696, 0.2682589491249039, 0.0039049648673670223),
	vec3(0.11265608432577405, 0.7152181441511631, -0.012881615429234917),
	vec3(0.08202277386852107, 0.01652290672393307, 1.0972357182341155)
);

const mat3 XYZ_TO_ERIMM_MATRIX = mat3(
	vec3(1.4033326999956865, -0.5260940117314153, -0.011170713298674006),
	vec3(-0.22287197027554964, 1.4813479659718698, 0.018184298685142385),
	vec3(-0.1015485971575263, 0.01702051398804627, 0.9119424192918343)
);

const float ERIMM_MIN = 0.001;
const float ERIMM_TOE = 0.002718281828459045;
const float ERIMM_LOG_RANGE = 12.664130203757509;
const float ERIMM_ENCODED_TOE = 0.0789631805667392;

float linearToERIMM(float v) {
	if (v > ERIMM_TOE) {
		return log(v / ERIMM_MIN) / ERIMM_LOG_RANGE;
	}

	return v / (ERIMM_TOE * ERIMM_LOG_RANGE);
}

float erimmToLinear(float v) {
	if (v > ERIMM_ENCODED_TOE) {
		return ERIMM_MIN * exp(v * ERIMM_LOG_RANGE);
	}

	return v * ERIMM_TOE * ERIMM_LOG_RANGE;
}

vec3 erimmrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        erimmToLinear(rgb.r),
        erimmToLinear(rgb.g),
        erimmToLinear(rgb.b)
    );
    return ERIMM_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_erimmrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_ERIMM_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToERIMM(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToERIMM(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToERIMM(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
