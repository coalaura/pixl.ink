const mat3 DCIP3_P3DCI_TO_XYZ_D65 = mat3(
	vec3(0.45918146430855733, 0.21512248220648936, 0.00027025994055355313),
	vec3(0.29569693266103547, 0.7092018703741698, 0.046939267840537244),
	vec3(0.19527629688577203, 0.07567564741934094, 1.041049539891157)
);

const mat3 DCIP3_XYZ_TO_P3DCI_D65 = mat3(
	vec3(2.6903784900548877, -0.8199439329650832, 0.03627153646965798),
	vec3(-1.0935957484642584, 1.7501465590572065, -0.07862742341960915),
	vec3(-0.42515611939587156, 0.026581003004798757, 0.9594809579882954)
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