const mat3 GOPRO_TO_XYZ_MATRIX = mat3(
	vec3(0.6064934151230054, 0.26796581013725096, -0.029407789948837377),
	vec3(0.2203613114357655, 0.8326371482539999, -0.0865014797083378),
	vec3(0.12329996729659397, -0.1006029583912508, 1.2041683373294227)
);

const mat3 XYZ_TO_GOPRO_MATRIX = mat3(
	vec3(1.8664652511941926, -0.6003840180694648, 0.0024535706562664986),
	vec3(-0.5183221953828145, 1.3782468225572135, 0.08634812599164925),
	vec3(-0.23441892793317085, 0.17662234667923865, 0.8374114486193805)
);

float linearToProtune(float v) {
    float s = v < 0.0 ? -1.0 : (v > 0.0 ? 1.0 : 0.0);
    return s * (log(abs(v) * 112.0 + 1.0) / log(113.0));
}

float protuneToLinear(float v) {
    float s = v < 0.0 ? -1.0 : (v > 0.0 ? 1.0 : 0.0);
    return s * ((pow(113.0, abs(v)) - 1.0) / 112.0);
}

vec3 goproprotunenative_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        protuneToLinear(rgb.r),
        protuneToLinear(rgb.g),
        protuneToLinear(rgb.b)
    );
    return GOPRO_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_goproprotunenative(vec3 xyz) {
    vec3 v3 = XYZ_TO_GOPRO_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToProtune(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToProtune(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToProtune(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
