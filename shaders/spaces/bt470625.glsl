const mat3 BT470_625_TO_XYZ_MATRIX = mat3(
    vec3(0.430574, 0.222015, 0.020183),
    vec3(0.341550, 0.706655, 0.129532),
    vec3(0.178304, 0.071330, 0.939185)
);

const mat3 XYZ_TO_BT470_625_MATRIX = mat3(
    vec3(3.063218, -0.969244, 0.067871),
    vec3(-1.393325, 1.875968, -0.228834),
    vec3(-0.475802, 0.041555, 1.069273)
);

vec3 bt470625_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.8),
        spow(rgb.g, 2.8),
        spow(rgb.b, 2.8)
    );
    return BT470_625_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_bt470625(vec3 xyz) {
    vec3 v3 = XYZ_TO_BT470_625_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.8), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.8), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.8), 0.0, 1.0)
    );
}