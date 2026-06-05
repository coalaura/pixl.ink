const mat3 AWG3_TO_XYZ_MATRIX = mat3(
    vec3(0.637996321288, 0.291948577035, 0.002798229158),
    vec3(0.214699111325, 0.823830491039, -0.067033379686),
    vec3(0.097731055743, -0.115778904791, 1.153135153206)
);

const mat3 XYZ_TO_AWG3_MATRIX = mat3(
    vec3(1.789094770, -0.639856006, -0.041537190),
    vec3(-0.482537243, 1.396415781, 0.082346452),
    vec3(-0.200078631, 0.194434444, 0.878988220)
);

vec3 arriwidegamut3_to_xyz(vec3 color) {
    return AWG3_TO_XYZ_MATRIX * color;
}

vec3 xyz_to_arriwidegamut3(vec3 xyz) {
    vec3 rgb = XYZ_TO_AWG3_MATRIX * xyz;
    return clamp_skip(rgb, 0.0, 1.0, u_clamped == 0);
}