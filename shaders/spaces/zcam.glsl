uniform ZcamParams u_params;

vec3 izazbzToXyz(vec3 izazbz, ZcamParams p) {
    vec3 outVal = IZAZBZ_TO_LMSP * izazbz;

    float lps1 = pqDecodeST2084(outVal.x, PQ_P_INV);
    float lps2 = pqDecodeST2084(outVal.y, PQ_P_INV);
    float lps3 = pqDecodeST2084(outVal.z, PQ_P_INV);

    outVal = CONE_TO_XYZ_JZAZBZ_MATRIX * vec3(lps1 / p.PQ_SCALE, lps2 / p.PQ_SCALE, lps3 / p.PQ_SCALE);

    outVal = undoPreAdaptXYZ(outVal);

    outVal = transpose(p.fromModel) * outVal;

    return outVal;
}

vec3 zcam_to_xyz(vec3 jmh) {
    float Jn = jmh.x;
    float Qz = Jn * u_params.QZ_W;

    float IzPrime = pow(max(zdiv(Qz, 2700.0 * u_params.KQ), 0.0), 1.0 / u_params.ALPHA);
    float iz = IzPrime + IZ_OFFSET;

    float Hdeg = jmh.z * 360.0;
    float Hrad = Hdeg * DEG2RAD;

    float eccentricity = 1.015 + cos((89.038 + Hdeg) * DEG2RAD);
    float C = pow(max(jmh.y * 80.0, 0.0) / (u_params.M_FACTOR * pow(eccentricity, 0.068)), 1.0 / 0.74);

    float az = C * cos(Hrad);
    float bz = C * sin(Hrad);

    return izazbzToXyz(vec3(iz, az, bz), u_params);
}

vec3 xyz_to_zcam(vec3 xyz) {
    vec3 izazbz = xyzToIzAzBz(xyz, u_params);

    float izRaw = izazbz.x;
    float az = izazbz.y;
    float bz = izazbz.z;

    float izp = max(izRaw - IZ_OFFSET, 0.0);
    float Qz = 2700.0 * pow(izp, u_params.ALPHA) * u_params.KQ;
    float Jz = u_params.QZ_W > 0.0 ? Qz / u_params.QZ_W : 0.0;

    float C = sqrt(az * az + bz * bz);

    float hDeg = 0.0;
    if (C > EPS_PRECISION) {
        hDeg = normalizeAngle360(atan(bz, az) * RAD2DEG);
    }

    float eccentricity = 1.015 + cos((89.038 + hDeg) * DEG2RAD);
    float Mz = u_params.M_FACTOR * pow(C, 0.74) * pow(eccentricity, 0.068) / 80.0;

    float Hz = C > EPS_PRECISION ? hDeg / 360.0 : 0.0;

    return vec3(
        clamp_skip(Jz, 0.0, 1.0, u_clamped == 0),
        clamp_skip(Mz, 0.0, 1.0, u_clamped == 0),
        clamp_skip(Hz, 0.0, 1.0, u_clamped == 0)
    );
}
