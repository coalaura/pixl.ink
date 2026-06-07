const mat3 BOLEX_TO_XYZ_MATRIX = mat3(
    vec3(0.600252, 0.262082, -0.016908),
    vec3(0.163510, 0.671252, 0.025817),
    vec3(0.186665, 0.066666, 1.079989)
);

const mat3 XYZ_TO_BOLEX_MATRIX = mat3(
    vec3(1.750381, -0.395015, 0.037817),
    vec3(-0.421677, 1.574676, -0.044192),
    vec3(-0.318274, -0.113000, 0.931475)
);

vec3 bolexwidegamut_to_xyz(vec3 rgb) {
    return BOLEX_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_bolexwidegamut(vec3 xyz) {
    vec3 v3 = XYZ_TO_BOLEX_MATRIX * xyz;
    return clamp(v3, 0.0, 1.0);
}