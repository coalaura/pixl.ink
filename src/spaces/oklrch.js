import { alloc3, free3 } from "../pool.js";
import {
	clamp,
	DEG2RAD,
	EPS_PERCEPTUAL,
	LMS_PRIME_TO_OKLAB_MATRIX,
	matmul,
	normalizeAngle360,
	OKLAB_LMS_TO_XYZ_MATRIX,
	OKLAB_TO_LMS_PRIME_MATRIX,
	OKLAB_XYZ_TO_LMS_MATRIX,
	okToe,
	okToeInv,
	RAD2DEG,
} from "../utils.js";

export default {
	name: "OKlrCH",
	long: "OKlrCH - Cylindrical OKlrab (Lr-Cr-hr)",
	css: "oklrch",
	tags: ["perceptual_uniform", "cylindrical_model"],
	base: "OKlrab",
	ui: {
		l: { from: 0, to: 1, step: 0.01, round: 2, name: "Lightness Lr", primary: true },
		c: { from: 0, to: 0.4, step: 0.01, round: 2, name: "Chroma Cr" },
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	from: (oklrch, out = {}) => {
		const Lr = oklrch.l,
			Cr = oklrch.c * 0.4,
			hDeg = oklrch.h * 360;

		let a_r = 0,
			b_r = 0;

		if (Cr > EPS_PERCEPTUAL) {
			const hRad = hDeg * DEG2RAD;

			a_r = Cr * Math.cos(hRad);
			b_r = Cr * Math.sin(hRad);
		}

		const v3 = matmul(alloc3(), OKLAB_TO_LMS_PRIME_MATRIX, okToeInv(Lr), a_r, b_r);

		v3[0] = v3[0] * v3[0] * v3[0];
		v3[1] = v3[1] * v3[1] * v3[1];
		v3[2] = v3[2] * v3[2] * v3[2];

		matmul(v3, OKLAB_LMS_TO_XYZ_MATRIX, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), OKLAB_XYZ_TO_LMS_MATRIX, xyz.x, xyz.y, xyz.z);

		v3[0] = Math.cbrt(v3[0]);
		v3[1] = Math.cbrt(v3[1]);
		v3[2] = Math.cbrt(v3[2]);

		matmul(v3, LMS_PRIME_TO_OKLAB_MATRIX, v3[0], v3[1], v3[2]);

		const Lr = okToe(v3[0]),
			a_r = v3[1],
			b_r = v3[2];

		free3(v3);

		const Cr = Math.hypot(a_r, b_r);

		let hNorm = 0;

		if (Cr > EPS_PERCEPTUAL) {
			const hDeg = normalizeAngle360(Math.atan2(b_r, a_r) * RAD2DEG);

			hNorm = hDeg / 360;
		}

		out.l = clamp(Lr, 0, 1, unclamped);
		out.c = clamp(Cr / 0.4, 0, 1, unclamped);
		out.h = clamp(hNorm, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, c: 0.0, h: 0.0 },
		"#FFFFFF": { l: 1.0, c: 0.0, h: 0.0 },
		"#FF0000": { l: 0.5681, c: 0.6442, h: 0.0812 },
		"#00FF00": { l: 0.8445, c: 0.7371, h: 0.3958 },
		"#0000FF": { l: 0.3666, c: 0.783, h: 0.7335 },
		"#FFFF00": { l: 0.9627, c: 0.5275, h: 0.3049 },
		"#00FFFF": { l: 0.8898, c: 0.3864, h: 0.541 },
		"#FF00FF": { l: 0.6533, c: 0.8062, h: 0.9121 },
		"#808080": { l: 0.5357, c: 0.0, h: 0.0 },
		"#FFA500": { l: 0.7588, c: 0.4276, h: 0.1963 },
	},
};
