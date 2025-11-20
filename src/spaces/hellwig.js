import { alloc3, free3 } from "../pool.js";
import {
	CAM_DEFAULTS,
	CAM_FL,
	CAM_Z,
	CAM16_D_RGB,
	CAM16_D_RGB_INV,
	CAM16_RGB_AW,
	CAT16_INV_MATRIX,
	CAT16_MATRIX,
	camAdapt,
	camUnadapt,
	clamp,
	DEG2RAD,
	EPS_PRECISION,
	M1_MATRIX,
	matmul,
	normalizeAngle360,
	normalizeAngleRad,
	RAD2DEG,
	spow,
} from "../utils.js";

const { C, NC } = CAM_DEFAULTS;

const A_W = 2 * CAM16_RGB_AW[0] + CAM16_RGB_AW[1] + 0.05 * CAM16_RGB_AW[2];

function eccentricity(h) {
	const h2 = 2 * h,
		h3 = 3 * h,
		h4 = 4 * h;

	return (
		-0.0582 * Math.cos(h) -
		0.0258 * Math.cos(h2) -
		0.1347 * Math.cos(h3) +
		0.0289 * Math.cos(h4) +
		-0.1475 * Math.sin(h) -
		0.0308 * Math.sin(h2) +
		0.0385 * Math.sin(h3) +
		0.0096 * Math.sin(h4) +
		1
	);
}

export default {
	name: "Hellwig JMh",
	long: "Hellwig & Fairchild 2022 (Revised CAM16), J-M-h",
	css: "hellwig-jmh",
	tags: ["appearance_model"],
	base: "CIE 1931 XYZ",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		m: { from: 0, to: 70, step: 1, round: 0, name: "Colorfulness M" },
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	from: (jmh, out = {}) => {
		const J = jmh.j * 100,
			M = jmh.m * 70;

		const hDeg = jmh.h * 360;

		if (J < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const hRad = normalizeAngle360(hDeg) * DEG2RAD,
			et = eccentricity(hRad);

		const A = A_W * spow(J / 100, 1 / (C * CAM_Z));

		let a = 0,
			b = 0;

		if (M > EPS_PRECISION) {
			const r = M / (43 * NC * et);

			a = r * Math.cos(hRad);
			b = r * Math.sin(hRad);
		}

		const v3 = matmul(alloc3(), M1_MATRIX, A, a, b);

		camUnadapt(v3, v3[0] / 1403, v3[1] / 1403, v3[2] / 1403, CAM_FL);

		matmul(v3, CAT16_INV_MATRIX, v3[0] * CAM16_D_RGB_INV[0], v3[1] * CAM16_D_RGB_INV[1], v3[2] * CAM16_D_RGB_INV[2]);

		out.x = v3[0] / 100;
		out.y = v3[1] / 100;
		out.z = v3[2] / 100;

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		if (xyz.x < EPS_PRECISION && xyz.y < EPS_PRECISION && xyz.z < EPS_PRECISION) {
			out.j = 0;
			out.m = 0;
			out.h = 0;

			return out;
		}

		const v3 = matmul(alloc3(), CAT16_MATRIX, xyz.x * 100, xyz.y * 100, xyz.z * 100);

		camAdapt(v3, v3[0] * CAM16_D_RGB[0], v3[1] * CAM16_D_RGB[1], v3[2] * CAM16_D_RGB[2], CAM_FL);

		const A = 2 * v3[0] + v3[1] + 0.05 * v3[2],
			a = v3[0] + (-12 * v3[1] + v3[2]) / 11,
			b = (v3[0] + v3[1] - 2 * v3[2]) / 9;

		free3(v3);

		const J = 100 * spow(A / A_W, C * CAM_Z);

		const hRad = normalizeAngleRad(Math.atan2(b, a)),
			hDeg = hRad * RAD2DEG,
			et = eccentricity(hRad);

		const M = 43 * NC * et * Math.hypot(a, b);

		const jN = J / 100,
			mN = M / 70,
			hN = hDeg / 360;

		const isAch = Math.abs(M) < EPS_PRECISION;

		out.j = clamp(jN, 0, 1, unclamped);
		out.m = clamp(isAch ? 0 : mN, 0, 1, unclamped);
		out.h = clamp(isAch ? 0 : hN, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { j: 0.0, m: 0.0, h: 0.0 },
		"#FFFFFF": { j: 1.0, m: 0.0148, h: 0.582 },
		"#FF0000": { j: 0.4603, m: 0.6764, h: 0.0761 },
		"#00FF00": { j: 0.791, m: 0.7236, h: 0.3951 },
		"#0000FF": { j: 0.2507, m: 0.9003, h: 0.7854 },
		"#FFFF00": { j: 0.9468, m: 0.4819, h: 0.3087 },
		"#00FFFF": { j: 0.8506, m: 0.45, h: 0.5461 },
		"#FF00FF": { j: 0.5486, m: 0.8349, h: 0.9294 },
		"#808080": { j: 0.4304, m: 0.008, h: 0.582 },
		"#FFA500": { j: 0.6806, m: 0.4461, h: 0.198 },
	},
};
