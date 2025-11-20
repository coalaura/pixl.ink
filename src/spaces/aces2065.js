import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, WHITEPOINT_D60, WHITEPOINT_D65 } from "../utils.js";

const [AP0_TO_XYZ_D60_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.0, 1.0],
		[0.0001, -0.077],
	],
	WHITEPOINT_D60
);

const [AP0_TO_XYZ_MATRIX, XYZ_TO_AP0_MATRIX] = preAdaptBradford(AP0_TO_XYZ_D60_MATRIX, WHITEPOINT_D60, WHITEPOINT_D65);

export default {
	name: "ACES 2065-1",
	long: "Academy Color Encoding System - ACES2065-1 (AP0, encoded with D60 white, XYZ normalized to D65)",
	css: "aces-2065-1",
	tags: ["device_rgb", "wide_gamut"],
	base: "ACES AP0",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), AP0_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_AP0_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.4396, g: 0.0898, b: 0.0175 },
		"#00FF00": { r: 0.383, g: 0.8134, b: 0.1115 },
		"#0000FF": { r: 0.1774, g: 0.0968, b: 0.8709 },
		"#FFFF00": { r: 0.8226, g: 0.9032, b: 0.1291 },
		"#00FFFF": { r: 0.5604, g: 0.9102, b: 0.9825 },
		"#FF00FF": { r: 0.617, g: 0.1866, b: 0.8885 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2159 },
		"#FFA500": { r: 0.5837, g: 0.3958, b: 0.0595 },
	},
};
