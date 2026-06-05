vec3 cieucs_to_xyz(vec3 uvy) {
    float u = uvy.x;
    float v = uvy.y;
    float Y = uvy.z;

    if (Y < EPS_PRECISION || v < EPS_PRECISION) {
        return vec3(0.0);
    }

    float X = (3.0 * u * Y) / (2.0 * v);
    float Z = Y * ((2.0 - 0.5 * u) / v - 5.0);

    return vec3(X, Y, Z);
}

vec3 xyz_to_cieucs(vec3 xyz) {
    float X = xyz.x;
    float Y = xyz.y;
    float Z = xyz.z;

    float denom = X + 15.0 * Y + 3.0 * Z;

    if (denom < EPS_PRECISION) {
        return vec3(0.0);
    }

    float u = (4.0 * X) / denom;
    float v = (6.0 * Y) / denom;

    bool skip = (u_clamped == 0);
    return vec3(
        clamp_skip(u, 0.0, 1.0, skip),
        clamp_skip(v, 0.0, 1.0, skip),
        clamp_skip(Y, 0.0, 1.0, skip)
    );
}