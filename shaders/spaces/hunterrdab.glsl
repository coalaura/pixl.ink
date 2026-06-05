uniform HunterParams u_params;

float hunter_f(float Y) {
    return zdiv(0.51 * (21.0 + 0.2 * Y), 1.0 + 0.21 * Y);
}

vec3 hunterrdab_to_xyz(vec3 rdab) {
    float Rd = rdab.x * 100.0;
    float a = rdab.y * 200.0 - 100.0;
    float b = rdab.z * 200.0 - 100.0;

    vec3 wp = u_params.wp;

    float Xn = wp.x * 100.0;
    float Yn = wp.y * 100.0;
    float Zn = wp.z * 100.0;

    float Y_val = Rd;
    float fY = hunter_f(Y_val);

    float X_val = 0.0;
    float Z_val = 0.0;

    if (abs(fY) > EPS_PRECISION) {
        X_val = Xn * (zdiv(a, u_params.KA * fY) + zdiv(Y_val, Yn));
        Z_val = Zn * (zdiv(Y_val, Yn) - zdiv(b, u_params.KB * fY));
    }

    return vec3(X_val / 100.0, Y_val / 100.0, Z_val / 100.0);
}

vec3 xyz_to_hunterrdab(vec3 xyz) {
    vec3 wp = u_params.wp;

    float Xn = wp.x * 100.0;
    float Yn = wp.y * 100.0;
    float Zn = wp.z * 100.0;

    float X_val = xyz.x * 100.0;
    float Y_val = xyz.y * 100.0;
    float Z_val = xyz.z * 100.0;

    float Rd = Y_val;
    float fY = hunter_f(Y_val);

    float a = u_params.KA * fY * (zdiv(X_val, Xn) - zdiv(Y_val, Yn));
    float b = u_params.KB * fY * (zdiv(Y_val, Yn) - zdiv(Z_val, Zn));

    bool skip = (u_clamped == 0);

    return vec3(
        clamp_skip(Rd / 100.0, 0.0, 1.0, skip),
        clamp_skip((a + 100.0) / 200.0, 0.0, 1.0, skip),
        clamp_skip((b + 100.0) / 200.0, 0.0, 1.0, skip)
    );
}