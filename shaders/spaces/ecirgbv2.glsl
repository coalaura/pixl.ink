const mat3 ECIRGBV2_TO_XYZ_MATRIX = mat3(
	vec3(0.6136946064295492, 0.3047640727182026, 0.0014392602499492084),
	vec3(0.16053637735608695, 0.6044340620027506, 0.08030189108913025),
	vec3(0.17592371006972848, 0.09080186527904693, 1.0065179163331683)
);

const mat3 XYZ_TO_ECIRGBV2_MATRIX = mat3(
	vec3(1.8562826672626322, -0.9469138972685274, 0.07289219754861767),
	vec3(-0.4553778907309579, 1.9068039158218881, -0.15147723712188163),
	vec3(-0.28336800294308456, -0.006514286777765456, 0.994449213081644)
);

float eciToLinear(float value) {
    return value <= 0.08 ? value * 2700.0 / 24389.0 : pow((100.0 * value + 16.0) / 116.0, 3.0);
}

float linearToEci(float value) {
    return value <= 216.0 / 24389.0 ? value * 24389.0 / 2700.0 : (116.0 * pow(value, 1.0 / 3.0) - 16.0) / 100.0;
}

vec3 ecirgbv2_to_xyz(vec3 rgb) {
    vec3 linear_eci = vec3(
        eciToLinear(rgb.r),
        eciToLinear(rgb.g),
        eciToLinear(rgb.b)
    );

    return ECIRGBV2_TO_XYZ_MATRIX * linear_eci;
}

vec3 xyz_to_ecirgbv2(vec3 xyz) {
    vec3 linear_eci = XYZ_TO_ECIRGBV2_MATRIX * xyz;

    vec3 rgb = vec3(
        linearToEci(linear_eci.r),
        linearToEci(linear_eci.g),
        linearToEci(linear_eci.b)
    );

    return clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);
}
