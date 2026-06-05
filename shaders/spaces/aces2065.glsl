const mat3 AP0_TO_XYZ_MATRIX = mat3(
    vec3(0.93828476, 0.33737365, 0.00117223),
    vec3(-0.00445068, 0.72952882, -0.00370271),
    vec3(0.01660040, -0.06690018, 1.09143100)
);

const mat3 XYZ_TO_AP0_MATRIX = mat3(
    vec3(1.06349015, -0.49207333, -0.00281160),
    vec3(0.00640800, 1.36820815, 0.00463479),
    vec3(-0.01578265, 0.09134987, 0.91655510)
);

vec3 aces2065_to_xyz(vec3 rgb) {
    return AP0_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_aces2065(vec3 xyz) {
    vec3 rgb = XYZ_TO_AP0_MATRIX * xyz;
    return clamp(rgb, 0.0, 1.0);
}