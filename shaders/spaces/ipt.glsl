const mat3 IPT_XYZ_TO_LMS = mat3(
	vec3(0.4002, -0.228, 0.0),
	vec3(0.7075, 1.15, 0.0),
	vec3(-0.0807, 0.0612, 0.9184)
);

const mat3 IPT_LMS_TO_XYZ = mat3(
	vec3(1.8502429449432054, 0.3668307751713486, 0.0),
	vec3(-1.138301637867233, 0.6438845448402355, 0.0),
	vec3(0.23843495850870133, -0.010673443584379992, 1.0888501742160277)
);

const mat3 IPT_LMS_TO_IPT = mat3(
	vec3(0.4, 4.455, 0.8056),
	vec3(0.4, -4.851, 0.3572),
	vec3(0.2, 0.396, -1.1628)
);

const mat3 IPT_IPT_TO_LMS = mat3(
	vec3(1.0, 1.0000000000000002, 0.9999999999999999),
	vec3(0.09756893051461393, -0.11387648547314713, 0.03261510991706641),
	vec3(0.2052264331645916, 0.13321715836999806, -0.6768871830691794)
);

vec3 ipt_to_xyz(vec3 ipt) {
    float I = ipt.x;
    float P_ = (ipt.y - 0.5) * 2.0;
    float T_ = (ipt.z - 0.5) * 2.0;

    vec3 v3 = IPT_IPT_TO_LMS * vec3(I, P_, T_);

    const float IPT_GAMMA_INV = 2.3255813953488373;
    v3 = vec3(
        spow(v3.x, IPT_GAMMA_INV),
        spow(v3.y, IPT_GAMMA_INV),
        spow(v3.z, IPT_GAMMA_INV)
    );

    return IPT_LMS_TO_XYZ * v3;
}

vec3 xyz_to_ipt(vec3 xyz) {
    vec3 v3 = IPT_XYZ_TO_LMS * xyz;

    const float IPT_GAMMA = 0.43;
    v3 = vec3(
        spow(v3.x, IPT_GAMMA),
        spow(v3.y, IPT_GAMMA),
        spow(v3.z, IPT_GAMMA)
    );

    v3 = IPT_LMS_TO_IPT * v3;

    float I = v3.x;
    float P = v3.y;
    float T = v3.z;

    bool skip = (u_clamped == 0);

    return vec3(
        clamp_skip(I, 0.0, 1.0, skip),
        clamp_skip(P / 2.0 + 0.5, 0.0, 1.0, skip),
        clamp_skip(T / 2.0 + 0.5, 0.0, 1.0, skip)
    );
}