const mat3 PROLAB_NUMERATOR_MATRIX = mat3(
    vec3(75.54, 617.72, 48.34),
    vec3(486.66, -595.45, 194.94),
    vec3(167.39, -22.27, -243.28)
);

const vec3 PROLAB_DENOMINATOR_VECTOR = vec3(0.7554, 3.8666, 1.6739);

vec3 xyzRelToProLabNative(vec3 rgb_rel) {
    vec3 out_val = PROLAB_NUMERATOR_MATRIX * rgb_rel;

    float d = dot(PROLAB_DENOMINATOR_VECTOR, rgb_rel) + 1.0;

    float invd = abs(d) < EPS_PRECISION ? 0.0 : 1.0 / d;

    return out_val * invd;
}

vec3 proLabNativeToXyzRel(vec3 Lab) {
    mat3 inv_num = invert3x3(PROLAB_NUMERATOR_MATRIX);
    vec3 out_val = inv_num * Lab;

    float x4 = 1.0 - dot(PROLAB_DENOMINATOR_VECTOR, out_val);

    float invx4 = abs(x4) < EPS_PRECISION ? 0.0 : 1.0 / x4;

    return out_val * invx4;
}

vec3 prolab_to_xyz(vec3 pro) {
    float L = pro.x * 100.0;
    float a = (pro.y - 0.5) * 320.0;
    float b = (pro.z - 0.5) * 320.0;

    vec3 v3 = proLabNativeToXyzRel(vec3(L, a, b));

    return v3 * WHITEPOINT_D65;
}

vec3 xyz_to_prolab(vec3 xyz) {
    vec3 rgb_rel = vec3(
        WHITEPOINT_D65.x > 0.0 ? xyz.x / WHITEPOINT_D65.x : 0.0,
        WHITEPOINT_D65.y > 0.0 ? xyz.y / WHITEPOINT_D65.y : 0.0,
        WHITEPOINT_D65.z > 0.0 ? xyz.z / WHITEPOINT_D65.z : 0.0
    );

    vec3 v3 = xyzRelToProLabNative(rgb_rel);

    float Ln = v3.x / 100.0;
    float an = v3.y / 320.0 + 0.5;
    float bn = v3.z / 320.0 + 0.5;

    return vec3(
        clamp(Ln, 0.0, 1.0),
        clamp(an, 0.0, 1.0),
        clamp(bn, 0.0, 1.0)
    );
}