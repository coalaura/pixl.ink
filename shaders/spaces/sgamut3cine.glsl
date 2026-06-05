const mat3 SGAMUT3CINE_TO_XYZ_MATRIX = mat3(
    vec3(0.59908392, 0.21507760, -0.03206585),
    vec3(0.20451356, 0.72733981, -0.02841679),
    vec3(0.14683102, 0.05758259, 1.14938303)
);

const mat3 XYZ_TO_SGAMUT3CINE_MATRIX = mat3(
    vec3(1.84743088, -0.54929867, 0.03795669),
    vec3(-0.52764890, 1.52907462, 0.02308326),
    vec3(-0.20959257, -0.00643304, 0.86402672)
);

vec3 sgamut3cine_to_xyz(vec3 rgb) {
    return SGAMUT3CINE_TO_XYZ_MATRIX * rgb;
}

vec3 xyz_to_sgamut3cine(vec3 xyz) {
    return XYZ_TO_SGAMUT3CINE_MATRIX * xyz;
}