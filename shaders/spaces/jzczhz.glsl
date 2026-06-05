vec3 jzczhz_to_xyz(vec3 jch) {
    float Jz = jch.x;
    float Cz_phys = jch.y * 0.26;
    float H_deg = jch.z * 360.0;
    float H_rad = H_deg * DEG2RAD;

    float Az_i = Cz_phys * cos(H_rad);
    float Bz_i = Cz_phys * sin(H_rad);

    float Az = Az_i / JZAZBZ_AZBZ_SCALE + 0.5;
    float Bz = Bz_i / JZAZBZ_AZBZ_SCALE + 0.5;

    return jzazbz_to_xyz(vec3(Jz, Az, Bz));
}

vec3 xyz_to_jzczhz(vec3 xyz) {
    vec3 jab = xyz_to_jzazbz(xyz);

    float Az_i = (jab.y - 0.5) * JZAZBZ_AZBZ_SCALE;
    float Bz_i = (jab.z - 0.5) * JZAZBZ_AZBZ_SCALE;

    float Cz_phys = sqrt(Az_i * Az_i + Bz_i * Bz_i);
    float H_rad = atan(Bz_i, Az_i);
    float H_deg = normalizeAngle360(H_rad * RAD2DEG);

    float Cz = Cz_phys / 0.26;
    float Hz = H_deg / 360.0;

    return vec3(
        clamp(jab.x, 0.0, 1.0),
        clamp(Cz, 0.0, 1.0),
        clamp(Hz, 0.0, 1.0)
    );
}