import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [AWG4_TO_XYZ_MATRIX, XYZ_TO_AWG4_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.1424, 0.8569],
		[0.0991, -0.0308],
	],
	WHITEPOINT_D65
);

export default {
	name: "ARRI Wide Gamut 4",
	long: "ARRI Wide Gamut 4 (AWG4) Linear RGB",
	css: "arri-wide-gamut-4",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), AWG4_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_AWG4_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.5659, g: 0.0886, b: 0.0177 },
		"#00FF00": { r: 0.3403, g: 0.8094, b: 0.1095 },
		"#0000FF": { r: 0.0939, g: 0.102, b: 0.8728 },
		"#FFFF00": { r: 0.9062, g: 0.8979, b: 0.1272 },
		"#00FFFF": { r: 0.4342, g: 0.9114, b: 0.9822 },
		"#FF00FF": { r: 0.6597, g: 0.1906, b: 0.8905 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2158 },
		"#FFA500": { r: 0.6939, g: 0.3931, b: 0.0589 },
	},
};
