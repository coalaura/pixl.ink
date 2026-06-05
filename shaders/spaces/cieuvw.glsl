vec2 cieuvw_uv1960FromXYZ(vec3 xyz) {
    float denom = xyz.x + 15.0 * xyz.y + 3.0 * xyz.z;

    if (abs(denom) < EPS_PRECISION) {
        return vec2(0.0);
    }

    return vec2((4.0 * xyz.x) / denom, (6.0 * xyz.y) / denom);
}

vec3 cieuvw_to_xyz(vec3 uvw) {
    float U = (uvw.x - 0.5) * 400.0;
    float V = (uvw.y - 0.5) * 400.0;
    float W = uvw.z * 100.0;

    vec3 wp = getWhitepointXYZ(u_whitepoint, u_observer);
    vec2 uv = cieuvw_uv1960FromXYZ(wp);

    float u = uv.x;
    float v = uv.y;

    if (abs(W) > EPS_PRECISION) {
        u = U / (13.0 * W) + uv.x;
        v = V / (13.0 * W) + uv.y;
    }

    if (abs(v) < EPS_PRECISION) {
        return vec3(0.0);
    }

    float Y100 = pow(max((W + 17.0) / 25.0, 0.0), 3.0);

    float Y = Y100 / 100.0;
    float D = (6.0 * Y) / v;

    float X = (u / 4.0) * D;
    float Z = (D - X - 15.0 * Y) / 3.0;

    return vec3(X, Y, Z);
}

vec3 xyz_to_cieuvw(vec3 xyz) {
    vec3 wp = getWhitepointXYZ(u_whitepoint, u_observer);

    vec2 uvW = cieuvw_uv1960FromXYZ(wp);
    vec2 uv = cieuvw_uv1960FromXYZ(xyz);

    float Y100 = xyz.y * 100.0;
    float W = 25.0 * spow(max(Y100, 0.0), 1.0 / 3.0) - 17.0;

    float uEff = (uv.x == 0.0 && uv.y == 0.0) ? uvW.x : uv.x;
    float vEff = (uv.x == 0.0 && uv.y == 0.0) ? uvW.y : uv.y;

    float U = 13.0 * W * (uEff - uvW.x);
    float V = 13.0 * W * (vEff - uvW.y);

    bool unclamped = (u_clamped == 0);

    return vec3(
        clamp_skip(U / 400.0 + 0.5, 0.0, 1.0, unclamped),
        clamp_skip(V / 400.0 + 0.5, 0.0, 1.0, unclamped),
        clamp_skip(W / 100.0, 0.0, 1.0, unclamped)
    );
}