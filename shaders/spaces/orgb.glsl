const float ORGB_PI = 3.141592653589793;

vec2 orgb_to_lcc(float Cyb, float Crg) {
    float c = length(vec2(Cyb, Crg));

    if (c < EPS_PRECISION) {
        return vec2(0.0, 0.0);
    }

    float signVal = Crg >= 0.0 ? 1.0 : -1.0;
    float theta_o = atan(abs(Crg), Cyb);

    float theta;
    if (theta_o < ORGB_PI / 2.0) {
        theta = (2.0 / 3.0) * theta_o;
    } else {
        theta = ORGB_PI / 3.0 + (4.0 / 3.0) * (theta_o - ORGB_PI / 2.0);
    }

    float C1 = c * cos(theta);
    float C2 = signVal * c * sin(theta);

    return vec2(C1, C2);
}

vec2 lcc_to_orgb(float C1, float C2) {
    float c = length(vec2(C1, C2));

    if (c < EPS_PRECISION) {
        return vec2(0.0, 0.0);
    }

    float signVal = C2 >= 0.0 ? 1.0 : -1.0;
    float theta = atan(abs(C2), C1);

    float theta_o;
    if (theta < ORGB_PI / 3.0) {
        theta_o = 1.5 * theta;
    } else {
        theta_o = ORGB_PI / 2.0 + 0.75 * (theta - ORGB_PI / 3.0);
    }

    float cyb = c * cos(theta_o);
    float crg = signVal * c * sin(theta_o);

    return vec2(cyb, crg);
}

vec3 orgb_to_xyz(vec3 orgb) {
    float L = orgb.x;
    float Cyb = orgb.y * 2.0 - 1.0;
    float Crg = orgb.z * 2.0 - 1.0;

    vec2 cc = orgb_to_lcc(Cyb, Crg);

    vec3 rgbPrime = vec3(L) + cc.x * vec3(0.114, 0.114, -0.886) + cc.y * vec3(0.7436, -0.4111, 0.1663);

    return srgbToXyz(rgbPrime);
}

vec3 xyz_to_orgb(vec3 xyz) {
    vec3 rgb = xyzToSrgb(xyz);

    float L = dot(rgb, vec3(0.299, 0.587, 0.114));
    float C1 = dot(rgb, vec3(0.5, 0.5, -1.0));
    float C2 = dot(rgb, vec3(0.866, -0.866, 0.0));

    vec2 orgb_cc = lcc_to_orgb(C1, C2);

    return vec3(
        clamp(L, 0.0, 1.0),
        clamp(orgb_cc.x * 0.5 + 0.5, 0.0, 1.0),
        clamp(orgb_cc.y * 0.5 + 0.5, 0.0, 1.0)
    );
}