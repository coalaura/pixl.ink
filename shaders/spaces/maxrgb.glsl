const mat3 MAX_TO_XYZ_MATRIX = mat3(
	vec3(0.7231515066338503, 0.2611298417176541, 0.0),
	vec3(0.12639381010699408, 0.7724066173205193, 0.03745001780947976),
	vec3(0.10060937711452031, -0.033536459038173434, 1.0508090498627678)
);

const mat3 XYZ_TO_MAX_MATRIX = mat3(
	vec3(1.466926264226328, -0.4951619916212281, 0.017647188523180517),
	vec3(-0.2328724196975747, 1.3712608942484599, -0.048870672476369136),
	vec3(-0.14788248550137953, 0.09117277241847267, 0.9483983585593779)
);

vec3 maxrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return MAX_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_maxrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_MAX_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.2), 0.0, 1.0, u_clamped == 0)
    );
}
