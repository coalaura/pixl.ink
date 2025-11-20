import { alloc3, free3 } from "../pool.js";
import { clamp, LMS_PRIME_TO_OKLAB_MATRIX, matmul, OKLAB_LMS_TO_XYZ_MATRIX, OKLAB_TO_LMS_PRIME_MATRIX, OKLAB_XYZ_TO_LMS_MATRIX, round } from "../utils.js";

export default {
	name: "OKLab",
	long: "OKLab - Perceptual Lab-Like Space (Björn Ottosson)",
	css: "oklab",
	tags: ["perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 1, step: 0.01, round: 2, name: "Lightness", primary: true },
		a: { from: -0.4, to: 0.4, step: 0.01, round: 2, name: "a" },
		b: { from: -0.4, to: 0.4, step: 0.01, round: 2, name: "b" },
	},

	from: (oklab, out = {}) => {
		const L = oklab.l,
			a = (oklab.a - 0.5) * 0.8,
			b = (oklab.b - 0.5) * 0.8;

		const v3 = matmul(alloc3(), OKLAB_TO_LMS_PRIME_MATRIX, L, a, b);

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

		const lVal = v3[0],
			aVal = v3[1],
			bVal = v3[2];

		free3(v3);

		out.l = clamp(lVal, 0, 1, unclamped);
		out.a = clamp(aVal / 0.8 + 0.5, 0, 1, unclamped);
		out.b = clamp(bVal / 0.8 + 0.5, 0, 1, unclamped);

		return out;
	},

	format: oklab => {
		const L = round(oklab.l * 100, 2),
			a = round(oklab.a * 0.8 - 0.4, 3),
			b = round(oklab.b * 0.8 - 0.4, 3);

		return `oklab(${L}% ${a} ${b})`;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.628, a: 0.7811, b: 0.6573 },
		"#00FF00": { l: 0.8664, a: 0.2076, b: 0.7244 },
		"#0000FF": { l: 0.452, a: 0.4594, b: 0.1106 },
		"#FFFF00": { l: 0.968, a: 0.4108, b: 0.7482 },
		"#00FFFF": { l: 0.9054, a: 0.3132, b: 0.4508 },
		"#FF00FF": { l: 0.7017, a: 0.8432, b: 0.2886 },
		"#808080": { l: 0.5999, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.7927, a: 0.5708, b: 0.7017 },
	},
};
