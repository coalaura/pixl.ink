const mat3 DCIP3_P3DCI_TO_XYZ_D65 = mat3(
    vec3(0.45925127, 0.21514964, 0.00027149),
    vec3(0.29578767, 0.70914111, 0.04693854),
    vec3(0.19538788, 0.07570752, 1.04169053)
);

const mat3 DCIP3_XYZ_TO_P3DCI_D65 = mat3(
    vec3(2.69035703, -0.82011030, 0.03625300),
    vec3(-1.09402814, 1.75054710, -0.07859451),
    vec3(-0.42511383, 0.02660107, 0.95894274)
);

vec3 dcip3_dciToLinear(vec3 v) {
    return vec3(
        spow(v.x, 2.6),
        spow(v.y, 2.6),
        spow(v.z, 2.6)
    );
}

vec3 dcip3_linearToDci(vec3 v) {
    return vec3(
        spow(v.x, 1.0 / 2.6),
        spow(v.y, 1.0 / 2.6),
        spow(v.z, 1.0 / 2.6)
    );
}

// Public Namespaced interface
vec3 dcip3_to_xyz(vec3 color) {
    vec3 rLinear = dcip3_dciToLinear(color);
    return DCIP3_P3DCI_TO_XYZ_D65 * rLinear;
}

vec3 xyz_to_dcip3(vec3 xyz) {
    vec3 rLinear = DCIP3_XYZ_TO_P3DCI_D65 * xyz;
    return dcip3_linearToDci(rLinear);
}