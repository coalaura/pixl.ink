const mat3 SGAMUT3_CINE_TO_XYZ_MATRIX = mat3(
	vec3(0.632042071771734, 0.22360696299878274, -0.04105882055310535),
	vec3(0.20037092163459488, 0.8800180733646705, -0.018443695825659454),
	vec3(0.11774170044903591, -0.10362503636345313, 1.1477615840510127)
);

const mat3 XYZ_TO_SGAMUT3_CINE_MATRIX = mat3(
	vec3(1.7076021253054532, -0.42750663417653717, 0.05421624819954655),
	vec3(-0.39321853161891923, 1.2369387726983871, 0.005810120710940604),
	vec3(-0.21067377225521333, 0.1555315893492135, 0.8662239393009492)
);

vec3 venicesgamut3cine_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        vsLog3ToLinear(rgb.r),
        vsLog3ToLinear(rgb.g),
        vsLog3ToLinear(rgb.b)
    );
    return SGAMUT3_CINE_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_venicesgamut3cine(vec3 xyz) {
    vec3 v3 = XYZ_TO_SGAMUT3_CINE_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToVSLog3(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToVSLog3(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToVSLog3(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
