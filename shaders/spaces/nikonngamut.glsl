const mat3 NIKON_TO_XYZ_MATRIX = mat3(
	vec3(0.6367575638699456, 0.262617526341842, 4.99253466463727e-17),
	vec3(0.14464412531584167, 0.6781256933925047, 0.028077977267192723),
	vec3(0.16875300466957738, 0.05925678026565312, 1.0601810904050546)
);

const mat3 XYZ_TO_NIKON_MATRIX = mat3(
	vec3(1.717191679135829, -0.6665588831960222, 0.01765323428139307),
	vec3(-0.35578276745570414, 1.6161770181602182, -0.04280304750419981),
	vec3(-0.2534460542695398, 0.0157655782057216, 0.9428175464548638)
);

float linearToNLog(float v) {
    if (v >= 0.328) {
        return (150.0 * log(v) + 619.0) / 1023.0;
    }
    return 650.0 * spow(v + 0.0075, 1.0 / 3.0) / 1023.0;
}

float nLogToLinear(float v) {
    if (v >= 452.0 / 1023.0) {
        return exp((1023.0 * v - 619.0) / 150.0);
    }
    return spow(1023.0 * v / 650.0, 3.0) - 0.0075;
}

vec3 nikonngamut_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        nLogToLinear(rgb.r),
        nLogToLinear(rgb.g),
        nLogToLinear(rgb.b)
    );
    return NIKON_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_nikonngamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_NIKON_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToNLog(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToNLog(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToNLog(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
