const mat3 RUSSELL_TO_XYZ_MATRIX = mat3(
    vec3(0.521743, 0.234351, 0.010134),
    vec3(0.298284, 0.701120, 0.063793),
    vec3(0.130401, 0.064529, 1.014973)
);

const mat3 XYZ_TO_RUSSELL_MATRIX = mat3(
    vec3(2.362913, -0.792265, -0.027005),
    vec3(-0.984365, 1.701548, -0.068531),
    vec3(-0.198305, -0.072210, 1.026410)
);

vec3 russellrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.2),
        spow(rgb.g, 2.2),
        spow(rgb.b, 2.2)
    );
    return RUSSELL_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_russellrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_RUSSELL_MATRIX * xyz;
    return vec3(
        clamp(spow(v3.r, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.g, 1.0 / 2.2), 0.0, 1.0),
        clamp(spow(v3.b, 1.0 / 2.2), 0.0, 1.0)
    );
}