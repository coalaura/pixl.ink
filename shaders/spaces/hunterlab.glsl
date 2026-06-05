uniform HunterParams u_params;

vec3 hunterlab_to_xyz(vec3 lab) {
    float l_frac = lab.x;

    if (l_frac < EPS_PRECISION) {
        return vec3(0.0);
    }

    float a_val = (lab.y - 0.5) * 420.0;
    float b_val = (lab.z - 0.5) * 420.0;

    vec3 wp = u_params.wp;
    float KA = u_params.KA;
    float KB = u_params.KB;

    float y_prime = l_frac * l_frac;
    float x_prime = zdiv(a_val * l_frac, KA) + y_prime;
    float z_prime = y_prime - zdiv(b_val * l_frac, KB);

    return vec3(
        x_prime * wp.x,
        y_prime * wp.y,
        z_prime * wp.z
    );
}

vec3 xyz_to_hunterlab(vec3 xyz) {
    vec3 wp = u_params.wp;
    float y_prime = zdiv(xyz.y, wp.y);

    if (y_prime < EPS_PRECISION) {
        return vec3(0.0, 0.5, 0.5);
    }

    float l_frac = sqrt(y_prime);
    float x_prime = zdiv(xyz.x, wp.x);
    float z_prime = zdiv(xyz.z, wp.z);

    float KA = u_params.KA;
    float KB = u_params.KB;

    float a_val = zdiv(KA * (x_prime - y_prime), l_frac);
    float b_val = zdiv(KB * (y_prime - z_prime), l_frac);

    bool unclamped = (u_clamped == 0);

    return vec3(
        clamp_skip(l_frac, 0.0, 1.0, unclamped),
        clamp_skip(a_val / 420.0 + 0.5, 0.0, 1.0, unclamped),
        clamp_skip(b_val / 420.0 + 0.5, 0.0, 1.0, unclamped)
    );
}