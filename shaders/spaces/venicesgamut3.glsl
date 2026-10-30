const mat3 VSGAMUT3_TO_XYZ_MATRIX = mat3(
	vec3(0.7440127255120472, 0.2807031478615581, -0.019923662082910285),
	vec3(0.07790995664496413, 0.7803201235530394, 0.014797224364526393),
	vec3(0.1282320116983534, -0.0610232714145974, 1.0933855053906314)
);

const mat3 XYZ_TO_VSGAMUT3_MATRIX = mat3(
	vec3(1.3906568708014109, -0.4977499860951336, 0.03207678866776647),
	vec3(-0.135611848071829, 1.3287092411566939, -0.02045307284739218),
	vec3(-0.1706646062316854, 0.13253300503761808, 0.9096870321957744)
);

vec3 venicesgamut3_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        vsLog3ToLinear(rgb.r),
        vsLog3ToLinear(rgb.g),
        vsLog3ToLinear(rgb.b)
    );
    return VSGAMUT3_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_venicesgamut3(vec3 xyz) {
    vec3 v3 = XYZ_TO_VSGAMUT3_MATRIX * xyz;
    return vec3(
        clamp_skip(linearToVSLog3(v3.r), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToVSLog3(v3.g), 0.0, 1.0, u_clamped == 0),
        clamp_skip(linearToVSLog3(v3.b), 0.0, 1.0, u_clamped == 0)
    );
}
