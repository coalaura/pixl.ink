uniform RlabParams u_params;

vec3 rlab_to_xyz(vec3 rlab) {
    float L_R = rlab.x * 100.0;
    float a_R = (rlab.y - 0.5) * 250.0;
    float b_R = (rlab.z - 0.5) * 250.0;

    float y_r = L_R * 0.01;
    float x_r = pow_sign(a_R / 430.0 + y_r, u_params.sigma);
    float z_r = pow_sign(y_r - b_R / 170.0, u_params.sigma);
    float y_comp = pow_sign(y_r, u_params.sigma);

    return u_params.IRAM * vec3(x_r, y_comp, z_r);
}

vec3 xyz_to_rlab(vec3 xyz) {
    vec3 v3 = u_params.RAM * xyz;

    float x_r = pow_sign(v3.x, u_params.sigmaInv);
    float y_r = pow_sign(v3.y, u_params.sigmaInv);
    float z_r = pow_sign(v3.z, u_params.sigmaInv);

    float L_R = 100.0 * y_r;
    float a_R = 430.0 * (x_r - y_r);
    float b_R = 170.0 * (y_r - z_r);

    float l = L_R / 100.0;
    float a = a_R / 250.0 + 0.5;
    float b = b_R / 250.0 + 0.5;

    return clamp_skip(vec3(l, a, b), 0.0, 1.0, u_clamped == 0);
}