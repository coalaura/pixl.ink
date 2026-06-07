const mat3 DWG_TO_XYZ_MATRIX = mat3(
    vec3(0.540121, 0.211320, -0.076326),
    vec3(0.170420, 0.999676, -0.158145),
    vec3(0.239887, -0.210996, 1.323371)
);

const mat3 XYZ_TO_DWG_MATRIX = mat3(
    vec3(1.861754, -0.370591, 0.063162),
    vec3(-0.355325, 1.030541, 0.102553),
    vec3(-0.280145, 0.231267, 0.781845)
);

float linearToDI(float v) {
    if (v > 0.01047561) {
        return 0.07632731 * log(v + 0.0075) + 0.53031317;
    }
    return 4.31671239 * v + 0.12453424;
}

float diToLinear(float v) {
    if (v > 0.16972242) {
        return exp((v - 0.53031317) / 0.07632731) - 0.0075;
    }
    return (v - 0.12453424) / 4.31671239;
}

vec3 davinciwidegamut_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        diToLinear(rgb.r),
        diToLinear(rgb.g),
        diToLinear(rgb.b)
    );
    return DWG_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_davinciwidegamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_DWG_MATRIX * xyz;
    return vec3(
        clamp(linearToDI(v3.r), 0.0, 1.0),
        clamp(linearToDI(v3.g), 0.0, 1.0),
        clamp(linearToDI(v3.b), 0.0, 1.0)
    );
}