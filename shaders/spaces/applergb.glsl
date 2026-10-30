const mat3 APPLE_RGB_TO_XYZ_MATRIX = mat3(
	vec3(0.4494319684363958, 0.24449099082939935, 0.02516819023243815),
	vec3(0.31635009404189035, 0.6722439498390169, 0.14122772055441532),
	vec3(0.1843726313770788, 0.08326505933158398, 0.921863156885394)
);

const mat3 XYZ_TO_APPLE_RGB_MATRIX = mat3(
	vec3(2.9534869015725946, -1.0847612367182842, 0.08554896247960457),
	vec3(-1.2902632747682432, 1.9902179441724654, -0.2696716429720405),
	vec3(-0.4741574716257744, 0.03719062657969214, 1.0920073445925984)
);

vec3 applergb_to_xyz(vec3 rgb) {
    vec3 rglLin = vec3(
        spow(rgb.r, 1.8),
        spow(rgb.g, 1.8),
        spow(rgb.b, 1.8)
    );

    return APPLE_RGB_TO_XYZ_MATRIX * rglLin;
}

vec3 xyz_to_applergb(vec3 xyz) {
    vec3 v3 = XYZ_TO_APPLE_RGB_MATRIX * xyz;

    return vec3(
        spow(v3.r, 1.0 / 1.8),
        spow(v3.g, 1.0 / 1.8),
        spow(v3.b, 1.0 / 1.8)
    );
}