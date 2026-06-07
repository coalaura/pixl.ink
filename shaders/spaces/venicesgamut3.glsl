const mat3 VSGAMUT3_TO_XYZ_MATRIX = mat3(
    vec3(0.540121, 0.207103, -0.007604),
    vec3(0.170420, 1.038753, -0.240028),
    vec3(0.239887, -0.245856, 1.336532)
);

const mat3 XYZ_TO_VSGAMUT3_MATRIX = mat3(
    vec3(1.861754, -0.370591, 0.053919),
    vec3(-0.355325, 1.030541, 0.186641),
    vec3(-0.280145, 0.231267, 0.811801)
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
        clamp(linearToVSLog3(v3.r), 0.0, 1.0),
        clamp(linearToVSLog3(v3.g), 0.0, 1.0),
        clamp(linearToVSLog3(v3.b), 0.0, 1.0)
    );
}