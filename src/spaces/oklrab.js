import { alloc3, free3 } from "../pool.js";
import { clamp, LMS_PRIME_TO_OKLAB_MATRIX, matmul, OKLAB_LMS_TO_XYZ_MATRIX, OKLAB_TO_LMS_PRIME_MATRIX, OKLAB_XYZ_TO_LMS_MATRIX, okToe, okToeInv } from "../utils.js";

export default {
	name: "OKlrab",
	long: "OKlrab - Oklab with revised lightness (toe-adjusted L)",
	css: "oklrab",
	tags: ["perceptual_uniform"],
	base: "OKLab",
	ui: {
		l: { from: 0, to: 1, step: 0.01, round: 2, name: "Lightness Lr", primary: true },
		a: { from: -0.4, to: 0.4, step: 0.01, round: 2, name: "a_r" },
		b: { from: -0.4, to: 0.4, step: 0.01, round: 2, name: "b_r" },
	},

	from: (oklrab, out = {}) => {
		const Lr = oklrab.l,
			a_r = (oklrab.a - 0.5) * 0.8,
			b_r = (oklrab.b - 0.5) * 0.8;

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

		out.l = clamp(okToe(v3[0]), 0, 1, unclamped);
		out.a = clamp(v3[1] / 0.8 + 0.5, 0, 1, unclamped);
		out.b = clamp(v3[2] / 0.8 + 0.5, 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.5681, a: 0.7811, b: 0.6573 },
		"#00FF00": { l: 0.8445, a: 0.2076, b: 0.7244 },
		"#0000FF": { l: 0.3666, a: 0.4594, b: 0.1106 },
		"#FFFF00": { l: 0.9627, a: 0.4108, b: 0.7482 },
		"#00FFFF": { l: 0.8898, a: 0.3132, b: 0.4508 },
		"#FF00FF": { l: 0.6533, a: 0.8432, b: 0.2886 },
		"#808080": { l: 0.5357, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.7588, a: 0.5708, b: 0.7017 },
	},
};
