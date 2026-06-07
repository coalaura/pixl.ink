float cam02lcd_jPrimeFromJ(float J) {
    return ((1.0 + 100.0 * CAM02_LCD_C1) * J) / (1.0 + CAM02_LCD_C1 * J);
}

float cam02lcd_jFromJPrime(float Jp) {
    return Jp / (1.0 + CAM02_LCD_C1 * (100.0 - Jp));
}

float cam02lcd_mPrimeFromM(float M) {
    return log(1.0 + CAM02_LCD_C2 * M) / CAM02_LCD_C2;
}

float cam02lcd_mFromMPrime(float Mp) {
    return (exp(CAM02_LCD_C2 * Mp) - 1.0) / CAM02_LCD_C2;
}

vec3 cam02lcd_to_xyz(vec3 lcd) {
    float Jp = lcd.x * 100.0;
    float ap = (lcd.y - 0.5) * 110.0;
    float bp = (lcd.z - 0.5) * 110.0;

    float Mp = length(vec2(ap, bp));

    float hDeg = 0.0;
    if (Mp > EPS_PRECISION) {
        hDeg = normalizeAngle360(atan(bp, ap) * RAD2DEG);
    }

    float J = cam02lcd_jFromJPrime(Jp);
    float M = cam02lcd_mFromMPrime(Mp);

    return cam02_to_xyz(vec3(J / 100.0, M / 120.0, hDeg / 360.0));
}

vec3 xyz_to_cam02lcd(vec3 xyz) {
    vec3 jmh = xyz_to_cam02(xyz);

    float J = jmh.x * 100.0;
    float M = jmh.y * 120.0;
    float hDeg = jmh.z * 360.0;

    float Jp = cam02lcd_jPrimeFromJ(J);
    float Mp = cam02lcd_mPrimeFromM(M);

    float hRad = hDeg * DEG2RAD;
    float ap = Mp * cos(hRad);
    float bp = Mp * sin(hRad);

    return vec3(
        clamp(Jp / 100.0, 0.0, 1.0),
        clamp(ap / 110.0 + 0.5, 0.0, 1.0),
        clamp(bp / 110.0 + 0.5, 0.0, 1.0)
    );
}