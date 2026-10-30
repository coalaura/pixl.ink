const mat3 ROMM_TO_XYZ_MATRIX = mat3(
	vec3(0.7554758356610696, 0.2682589491249039, 0.0039049648673670223),
	vec3(0.11265608432577405, 0.7152181441511631, -0.012881615429234917),
	vec3(0.08202277386852107, 0.01652290672393307, 1.0972357182341155)
);

const mat3 XYZ_TO_ROMM_MATRIX = mat3(
	vec3(1.4033326999956865, -0.5260940117314153, -0.011170713298674006),
	vec3(-0.22287197027554964, 1.4813479659718698, 0.018184298685142385),
	vec3(-0.1015485971575263, 0.01702051398804627, 0.9119424192918343)
);

vec3 rommrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        prophotoToLinear(rgb.r),
        prophotoToLinear(rgb.g),
        prophotoToLinear(rgb.b)
    );
    return ROMM_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_rommrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_ROMM_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToProphoto(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToProphoto(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToProphoto(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
