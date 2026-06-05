const float JZAZBZ_D = -0.56;
const float JZAZBZ_D0 = 1.6295499532821566e-11;

const mat3 JZAZBZ_CONE_TO_IAB = mat3(
    vec3(0.5, 3.524, 0.199076),
    vec3(0.5, -4.066708, 1.096799),
    vec3(0.0, 0.542708, -1.295875)
);

const mat3 JZAZBZ_IAB_TO_CONE = mat3(
    vec3(1.0000107111586554, 0.9999892888413446, 0.9999892760377073),
    vec3(0.1386035541655079, -0.1386035541655079, -0.09601821100582496),
    vec3(0.05804669463283259, -0.05804669463283259, -0.8118831917631168)
);

vec3 jzazbz_to_xyz(vec3 jab) {
    float Az_i = (jab.y - 0.5) * JZAZBZ_AZBZ_SCALE;
    float Bz_i = (jab.z - 0.5) * JZAZBZ_AZBZ_SCALE;

    float Jz_raw = jab.x;

    float Iz_num = Jz_raw + JZAZBZ_D0;
    float Iz_den = 1.0 + JZAZBZ_D - JZAZBZ_D * (Jz_raw + JZAZBZ_D0);
    float Iz = zdiv(Iz_num, Iz_den);

    vec3 v3 = JZAZBZ_IAB_TO_CONE * vec3(Iz, Az_i, Bz_i);

    v3.x = pqDecodeST2084(v3.x, PQ_P_INV) / PQ_LUMINANCE_SCALE;
    v3.y = pqDecodeST2084(v3.y, PQ_P_INV) / PQ_LUMINANCE_SCALE;
    v3.z = pqDecodeST2084(v3.z, PQ_P_INV) / PQ_LUMINANCE_SCALE;

    v3 = CONE_TO_XYZ_JZAZBZ_MATRIX * v3;

    float z = v3.z;
    float x = (v3.x + (PRE_ADAPT_B - 1.0) * z) / PRE_ADAPT_B;
    float y = (v3.y + (PRE_ADAPT_G - 1.0) * x) / PRE_ADAPT_G;

    return vec3(x, y, z);
}

vec3 xyz_to_jzazbz(vec3 xyz) {
    float xAdapt = PRE_ADAPT_B * xyz.x - (PRE_ADAPT_B - 1.0) * xyz.z;
    float yAdapt = PRE_ADAPT_G * xyz.y - (PRE_ADAPT_G - 1.0) * xyz.x;
    float zAdapt = xyz.z;

    vec3 v3 = XYZ_TO_CONE_JZAZBZ_MATRIX * vec3(xAdapt, yAdapt, zAdapt);

    v3.x = pqEncodeST2084(v3.x * PQ_LUMINANCE_SCALE, PQ_P);
    v3.y = pqEncodeST2084(v3.y * PQ_LUMINANCE_SCALE, PQ_P);
    v3.z = pqEncodeST2084(v3.z * PQ_LUMINANCE_SCALE, PQ_P);

    v3 = JZAZBZ_CONE_TO_IAB * v3;

    float Iz = v3.x;
    float Az_i = v3.y;
    float Bz_i = v3.z;

    float Jz_raw_num = (1.0 + JZAZBZ_D) * Iz;
    float Jz_raw_den = 1.0 + JZAZBZ_D * Iz;
    float Jz_raw = zdiv(Jz_raw_num, Jz_raw_den) - JZAZBZ_D0;

    float Jz_scaled = Jz_raw;
    float Az_scaled = Az_i / JZAZBZ_AZBZ_SCALE + 0.5;
    float Bz_scaled = Bz_i / JZAZBZ_AZBZ_SCALE + 0.5;

    return vec3(
        clamp(Jz_scaled, 0.0, 1.0),
        clamp(Az_scaled, 0.0, 1.0),
        clamp(Bz_scaled, 0.0, 1.0)
    );
}