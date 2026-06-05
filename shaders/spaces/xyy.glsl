vec3 xyy_to_xyz(vec3 xyy) {
    float x = xyy.x;
    float y = xyy.y;
    float Y = xyy.z;

    if (y < EPS_PRECISION) {
        return vec3(0.0);
    }

    float inv_y = 1.0 / y;
    return vec3(
        x * Y * inv_y,
        Y,
        (1.0 - x - y) * Y * inv_y
    );
}

vec3 xyz_to_xyy(vec3 xyz) {
    float X = xyz.x;
    float Y = xyz.y;
    float Z = xyz.z;

    float sum = X + Y + Z;

    if (sum < EPS_PRECISION) {
        return vec3(0.3127, 0.329, 0.0);
    }

    float inv_sum = 1.0 / sum;
    return vec3(
        X * inv_sum,
        Y * inv_sum,
        clamp_skip(Y, 0.0, 1.0, u_clamped == 0)
    );
}