vec3 cielab_to_xyz(vec3 lab) {
    float L = lab.x * 100.0;
    float a = (lab.y - 0.5) * 260.0;
    float b = (lab.z - 0.5) * 260.0;

    float fy = (L + 16.0) / 116.0;
    float fx = fy + a / 500.0;
    float fz = fy - b / 200.0;

    vec3 f = vec3(fx, fy, fz);
    vec3 r = vec3(fLabInv(f.x), fLabInv(f.y), fLabInv(f.z));

    vec3 wp = getWhitepointXYZ(u_whitepoint, u_observer);
    return r * wp;
}

vec3 xyz_to_cielab(vec3 xyz) {
    vec3 wp = getWhitepointXYZ(u_whitepoint, u_observer);
    vec3 r = xyz / wp;
    vec3 f = vec3(fLab(r.x), fLab(r.y), fLab(r.z));

    float L = 116.0 * f.y - 16.0;
    float a = 500.0 * (f.x - f.y);
    float b = 200.0 * (f.y - f.z);

    bool unclamped = (u_clamped == 0);
    return vec3(
        clamp_skip(L, 0.0, 100.0, unclamped) / 100.0,
        clamp_skip(a, -130.0, 130.0, unclamped) / 260.0 + 0.5,
        clamp_skip(b, -130.0, 130.0, unclamped) / 260.0 + 0.5
    );
}