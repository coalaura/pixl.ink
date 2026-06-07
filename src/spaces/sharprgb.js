import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, spow, WHITEPOINT_D65 } from "../utils.js";

const [SHARP_TO_XYZ_MATRIX, XYZ_TO_SHARP_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.69, 0.31],
		[0.21, 0.71],
		[0.15, 0.08],
	],
	WHITEPOINT_D65
);

export default {
	name: "Sharp RGB",
	long: "Sharp RGB Color Space (Sharp Electronics)",
	css: "sharp-rgb",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 2.2),
			g_lin = spow(rgb.g, 2.2),
			b_lin = spow(rgb.b, 2.2);

		const v3 = matmul(alloc3(), SHARP_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_SHARP_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 2.2),
			g = spow(v3[1], 1 / 2.2),
			b = spow(v3[2], 1 / 2.2);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.8563, g: 0.2531, b: 0.1507 },
		"#00FF00": { r: 0.564, g: 0.9979, b: 0.2479 },
		"#0000FF": { r: 0.0933, g: -0.2418, b: 0.9713 },
		"#FFFF00": { r: 0.9975, g: 1.0198, b: 0.2827 },
		"#00FFFF": { r: 0.5689, g: 0.9776, b: 0.9929 },
		"#FF00FF": { r: 0.8593, g: 0.0872, b: 0.9786 },
		"#808080": { r: 0.4981, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.9125, g: 0.6765, b: 0.2123 },
	},
};
