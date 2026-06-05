vec3 redwidegamut_to_xyz(vec3 rgb) {
    const mat3 REDWIDEGAMUT_TO_XYZ_MAT = mat3(
        vec3(0.7352643564, 0.2866898392, -0.079680708),
        vec3(0.0686086283, 0.842969489, -0.347339176),
        vec3(0.146555541, -0.1296593282, 1.515919183)
    );
    return REDWIDEGAMUT_TO_XYZ_MAT * rgb;
}

vec3 xyz_to_redwidegamut(vec3 xyz) {
    const mat3 XYZ_TO_REDWIDEGAMUT_MAT = mat3(
        vec3(1.412837198, -0.486211545, -0.037142278),
        vec3(-0.177526897, 1.290717058, 0.286395735),
        vec3(-0.151773903, 0.157403352, 0.687757763)
    );
    return XYZ_TO_REDWIDEGAMUT_MAT * xyz;
}