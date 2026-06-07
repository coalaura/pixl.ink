import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [BOLEX_TO_XYZ_MATRIX, XYZ_TO_BOLEX_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.71, 0.31],
		[0.19, 0.78],
		[0.14, 0.05],
	],
	WHITEPOINT_D65
);

export default {
	name: "Bolex Wide Gamut",
	long: "Bolex Wide Gamut Linear RGB",
	css: "bolex-wide-gamut",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), BOLEX_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_BOLEX_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.6635, g: 0.0549, b: 0.027 },
		"#00FF00": { r: 0.3125, g: 0.9343, b: 0.093 },
		"#0000FF": { r: 0.024, g: 0.0107, b: 0.88 },
		"#FFFF00": { r: 0.976, g: 0.9893, b: 0.12 },
		"#00FFFF": { r: 0.3365, g: 0.9451, b: 0.973 },
		"#FF00FF": { r: 0.6875, g: 0.0657, b: 0.907 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2159 },
		"#FFA500": { r: 0.7811, g: 0.4065, b: 0.062 },
	},
};
