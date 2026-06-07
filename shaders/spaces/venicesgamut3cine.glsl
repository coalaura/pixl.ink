const mat3 SGAMUT3_CINE_TO_XYZ_MATRIX = mat3(
    vec3(0.551670, 0.198305, -0.013589),
    vec3(0.221710, 0.787612, -0.211771),
    vec3(0.177048, 0.014083, 1.314260)
);

const mat3 XYZ_TO_SGAMUT3_CINE_MATRIX = mat3(
    vec3(2.015401, -0.547586, 0.057037),
    vec3(-0.488118, 1.503636, -0.004944),
    vec3(-0.392407, -0.071400, 0.972322)
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
        clamp(linearToVSLog3(v3.r), 0.0, 1.0),
        clamp(linearToVSLog3(v3.g), 0.0, 1.0),
        clamp(linearToVSLog3(v3.b), 0.0, 1.0)
    );
}