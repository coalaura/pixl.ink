uniform ZcamParams u_params;

vec3 izazbzToXyz(vec3 izazbz, ZcamParams p) {
    vec3 outVal = IZAZBZ_TO_LMSP * izazbz;

    float lps1 = pqDecodeST2084(outVal.x, PQ_P_INV);
    float lps2 = pqDecodeST2084(outVal.y, PQ_P_INV);
    float lps3 = pqDecodeST2084(outVal.z, PQ_P_INV);

    outVal = CONE_TO_XYZ_JZAZBZ_MATRIX * vec3(lps1 / PQ_LUMINANCE_SCALE, lps2 / PQ_LUMINANCE_SCALE, lps3 / PQ_LUMINANCE_SCALE);

    outVal = undoPreAdaptXYZ(outVal);

    outVal = adaptTwoStage(outVal, p.wp, p.wp, p.D_ADAPT, p.D_ADAPT, WHITEPOINT_E);

    return outVal;
}

vec3 zcam_to_xyz(vec3 jmh) {
    float Jn = jmh.x;
    float Qz = Jn * u_params.QZ_W;

    float IzPrime = pow(max(zdiv(Qz, 2700.0 * u_params.KQ), 0.0), 1.0 / u_params.ALPHA);
    float iz = IzPrime + IZ_OFFSET;

    float Hdeg = jmh.z * 360.0;
    float Hrad = Hdeg * DEG2RAD;

    float s = interpScale(Hdeg);
    float C = jmh.y * (0.22 / max(s, EPS_PRECISION));

    float az = C * cos(Hrad);
    float bz = C * sin(Hrad);

    return izazbzToXyz(vec3(iz, az, bz), u_params);
}

vec3 xyz_to_zcam(vec3 xyz) {
    vec3 izazbz = xyzToIzAzBz(xyz, u_params.wp, u_params.D_ADAPT);

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

    float s = interpScale(hDeg);
    float Mz = (s * C) / 0.22;

    float Hz = C > EPS_PRECISION ? hDeg / 360.0 : 0.0;

    return vec3(
        clamp(Jz, 0.0, 1.0),
        clamp(Mz, 0.0, 1.0),
        clamp(Hz, 0.0, 1.0)
    );
}