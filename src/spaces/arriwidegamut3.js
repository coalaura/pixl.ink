import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [AWG3_TO_XYZ_MATRIX, XYZ_TO_AWG3_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.684, 0.313],
		[0.221, 0.848],
		[0.0861, -0.102],
	],
	WHITEPOINT_D65
);

export default {
	name: "ARRI Wide Gamut 3",
	long: "ARRI Wide Gamut 3 (AWG3) Linear RGB",
	css: "arri-wide-gamut-3",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), AWG3_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_AWG3_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0001, g: 1.0, b: 0.9999 },
		"#FF0000": { r: 0.6314, g: 0.0368, b: 0.0173 },
		"#00FF00": { r: 0.2708, g: 0.7931, b: 0.1488 },
		"#0000FF": { r: 0.0979, g: 0.1701, b: 0.8338 },
		"#FFFF00": { r: 0.9022, g: 0.8298, b: 0.1661 },
		"#00FFFF": { r: 0.3687, g: 0.9632, b: 0.9826 },
		"#FF00FF": { r: 0.7293, g: 0.2069, b: 0.8512 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2158 },
		"#FFA500": { r: 0.7333, g: 0.3352, b: 0.0733 },
	},
};
