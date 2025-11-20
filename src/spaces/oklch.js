import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PERCEPTUAL, LMS_PRIME_TO_OKLAB_MATRIX, matmul, OKLAB_LMS_TO_XYZ_MATRIX, OKLAB_TO_LMS_PRIME_MATRIX, OKLAB_XYZ_TO_LMS_MATRIX, round, TAU } from "../utils.js";

export default {
	name: "OKLCh",
	long: "OKLCh - Polar OKLab (L-C-h°)",
	css: "oklch",
	tags: ["perceptual_uniform", "cylindrical_model"],
	base: "OKLab",
	ui: {
		l: { from: 0, to: 1, step: 0.001, round: 3, name: "Lightness", primary: true },
		c: { from: 0, to: 0.4, step: 0.001, round: 3, name: "Chroma" },
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	from: (lch, out = {}) => {
		const L = lch.l,
			C = lch.c * 0.4,
			h = lch.h;

		const hueRadians = h * TAU,
			a = C * Math.cos(hueRadians),
			b = C * Math.sin(hueRadians);

		const v3 = matmul(alloc3(), OKLAB_TO_LMS_PRIME_MATRIX, L, a, b);

		v3[0] = v3[0] ** 3;
		v3[1] = v3[1] ** 3;
		v3[2] = v3[2] ** 3;

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

		const L = v3[0],
			a = v3[1],
			b = v3[2];

		free3(v3);

		const C = Math.sqrt(a * a + b * b);

		let h = 0;

		if (C > EPS_PERCEPTUAL) {
			h = Math.atan2(b, a) / TAU;

			if (h < 0) {
				h += 1;
			}
		}

		out.l = clamp(L, 0, 1, unclamped);
		out.c = clamp(C / 0.4, 0, 1, unclamped);
		out.h = h;

		return out;
	},

	format: oklch => {
		const L = round(oklch.l * 100, 2),
			C = round(oklch.c, 3),
			H = Math.round(oklch.h * 360);

		return `oklch(${L}% ${C} ${H})`;
	},

	expected: {
		"#000000": { l: 0.0, c: 0.0, h: 0.0 },
		"#FFFFFF": { l: 1.0, c: 0.0, h: 0.0 },
		"#FF0000": { l: 0.628, c: 0.6442, h: 0.0812 },
		"#00FF00": { l: 0.8664, c: 0.7371, h: 0.3958 },
		"#0000FF": { l: 0.452, c: 0.783, h: 0.7335 },
		"#FFFF00": { l: 0.968, c: 0.5275, h: 0.3049 },
		"#00FFFF": { l: 0.9054, c: 0.3864, h: 0.541 },
		"#FF00FF": { l: 0.7017, c: 0.8062, h: 0.9121 },
		"#808080": { l: 0.5999, c: 0.0, h: 0.0 },
		"#FFA500": { l: 0.7927, c: 0.4276, h: 0.1963 },
	},
};
