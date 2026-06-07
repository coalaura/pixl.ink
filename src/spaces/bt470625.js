import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, spow, WHITEPOINT_D65 } from "../utils.js";

const [BT470_625_TO_XYZ_MATRIX, XYZ_TO_BT470_625_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.64, 0.33],
		[0.29, 0.6],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export default {
	name: "BT.470 625-line",
	long: "ITU-R BT.470 System B/G (625-line, historical PAL, Gamma 2.8)",
	css: "bt470-625",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 255, step: 1, round: 0, name: "Red" },
		g: { from: 0, to: 255, step: 1, round: 0, name: "Green" },
		b: { from: 0, to: 255, step: 1, round: 0, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 2.8),
			g_lin = spow(rgb.g, 2.8),
			b_lin = spow(rgb.b, 2.8);

		const v3 = matmul(alloc3(), BT470_625_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_BT470_625_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 2.8),
			g = spow(v3[1], 1 / 2.8),
			b = spow(v3[2], 1 / 2.8);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.9847, g: 0, b: 0 },
		"#00FF00": { r: 0.3229, g: 1, b: -0.2057 },
		"#0000FF": { r: 0, g: 0, b: 1.0043 },
		"#FFFF00": { r: 1, g: 1, b: -0.2057 },
		"#00FFFF": { r: 0.3229, g: 1, b: 1 },
		"#FF00FF": { r: 0.9847, g: 0, b: 1.0043 },
		"#808080": { r: 0.5784, g: 0.5784, b: 0.5784 },
		"#FFA500": { r: 0.9905, g: 0.7053, b: -0.1451 },
	},
};
