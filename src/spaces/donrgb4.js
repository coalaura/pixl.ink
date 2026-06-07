import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const DON_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [DON_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.69, 0.31],
		[0.21, 0.71],
		[0.15, 0.08],
	],
	DON_WP
);

const [DON_TO_XYZ_MATRIX, XYZ_TO_DON_MATRIX] = preAdaptBradford(DON_TO_XYZ_NATIVE, DON_WP, WHITEPOINT_D65);

export default {
	name: "Don RGB 4",
	long: "Don RGB 4 Color Space (Don Hutcheson)",
	css: "don-rgb-4",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 1.8),
			g_lin = spow(rgb.g, 1.8),
			b_lin = spow(rgb.b, 1.8);

		const v3 = matmul(alloc3(), DON_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_DON_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 1.8),
			g = spow(v3[1], 1 / 1.8),
			b = spow(v3[2], 1 / 1.8);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.8045, g: 0.1842, b: 0.0931 },
		"#00FF00": { r: 0.5217, g: 0.9889, b: 0.1559 },
		"#0000FF": { r: 0.0934, g: -0.1366, b: 0.9724 },
		"#FFFF00": { r: 0.9922, g: 1.0153, b: 0.1876 },
		"#00FFFF": { r: 0.5347, g: 0.9733, b: 0.9922 },
		"#FF00FF": { r: 0.8137, g: 0.1132, b: 0.9803 },
		"#808080": { r: 0.4267, g: 0.4267, b: 0.4267 },
		"#FFA500": { r: 0.8789, g: 0.6146, b: 0.135 },
	},
};
