const mat3 BT470_525_TO_XYZ_MATRIX = mat3(
    vec3(0.632289, 0.298284, 0.011614),
    vec3(0.198305, 0.640612, 0.059193),
    vec3(0.119834, 0.061104, 1.018093)
);

const mat3 XYZ_TO_BT470_525_MATRIX = mat3(
    vec3(1.936081, -0.901586, 0.030282),
    vec3(-0.584347, 1.902636, -0.103853),
    vec3(-0.193910, -0.073400, 0.988470)
);

vec3 bt470525_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return BT470_525_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_bt470525(vec3 xyz) {
    vec3 v3 = XYZ_TO_BT470_525_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.2), 0.0, 1.0)
    );
}