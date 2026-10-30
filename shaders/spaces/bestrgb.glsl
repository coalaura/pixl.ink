const mat3 BEST_TO_XYZ_MATRIX = mat3(
	vec3(0.5992310638840685, 0.21277860639960364, 0.003097354199098486),
	vec3(0.1789311909361512, 0.7391768137085888, 0.00009628431140207283),
	vec3(0.17199243903514527, 0.048044579891807986, 1.0850654291617472)
);

const mat3 XYZ_TO_BEST_MATRIX = mat3(
	vec3(1.8272500732691008, -0.5256541602679657, -0.005169299737730294),
	vec3(-0.4422839352309284, 1.4800981202525538, 0.0011311758191517637),
	vec3(-0.270051780374209, 0.01778496320003323, 0.9223727037144318)
);

vec3 bestrgb_to_xyz(vec3 rgb) {
    vec3 rgb_lin = vec3(
        spow(rgb.r, 2.0),
        spow(rgb.g, 2.0),
        spow(rgb.b, 2.0)
    );
    return BEST_TO_XYZ_MATRIX * rgb_lin;
}

vec3 xyz_to_bestrgb(vec3 xyz) {
    vec3 v3 = XYZ_TO_BEST_MATRIX * xyz;
    return vec3(
        clamp_skip(spow(v3.r, 1.0 / 2.0), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.g, 1.0 / 2.0), 0.0, 1.0, u_clamped == 0),
        clamp_skip(spow(v3.b, 1.0 / 2.0), 0.0, 1.0, u_clamped == 0)
    );
}
