const mat3 ICACB_XYZ_TO_LMS_MATRIX = mat3(
	vec3(0.37613, -0.21649, 0.02567),
	vec3(0.70431, 1.14744, 0.16713),
	vec3(-0.05675, 0.05356, 0.74235)
);
const mat3 ICACB_LMS_TO_XYZ_MATRIX = mat3(
	vec3(1.938009763032372, 0.3726932255022944, -0.15092197668921595),
	vec3(-1.2240118236920856, 0.6453747900837897, -0.10297178575136792),
	vec3(0.2364654507025463, -0.018072247874496645, 1.3429653757226785)
);
const mat3 ICACB_LMS_TO_OPPONENT_MATRIX = mat3(
	vec3(0.4949, 4.2854, 0.3605),
	vec3(0.5037, -4.5462, 1.1499),
	vec3(0.0015, 0.2609, -1.5105)
);
const mat3 ICACB_OPPONENT_TO_LMS_MATRIX = mat3(
	vec3(0.9998905049616944, 0.9999095312780033, 0.999838793151451),
	vec3(0.11610737965679685, -0.11390319857447988, -0.059000713455490995),
	vec3(0.02104750156233091, -0.018680887263267, -0.6712304057933204)
);

vec3 icacb_to_xyz(vec3 icacb) {
	vec3 encoded = ICACB_OPPONENT_TO_LMS_MATRIX * vec3(icacb.x, icacb.yz - 0.5);
	vec3 linear = vec3(pqDecodeST2084(encoded.x), pqDecodeST2084(encoded.y), pqDecodeST2084(encoded.z)) / PQ_LUMINANCE_SCALE;
	return ICACB_LMS_TO_XYZ_MATRIX * linear;
}

vec3 xyz_to_icacb(vec3 xyz) {
	vec3 linear = ICACB_XYZ_TO_LMS_MATRIX * xyz * PQ_LUMINANCE_SCALE;
	vec3 encoded = vec3(pqEncodeST2084(linear.x), pqEncodeST2084(linear.y), pqEncodeST2084(linear.z));
	vec3 opponent = ICACB_LMS_TO_OPPONENT_MATRIX * encoded;
	return clamp_skip(vec3(opponent.x, opponent.yz + 0.5), 0.0, 1.0, u_clamped == 0);
}
