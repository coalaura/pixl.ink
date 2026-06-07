import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const XTREME_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [XTREME_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.1, 0.88],
		[0.04, -0.1],
	],
	XTREME_WP
);

const [XTREME_TO_XYZ_MATRIX, XYZ_TO_XTREME_MATRIX] = preAdaptBradford(XTREME_TO_XYZ_NATIVE, XTREME_WP, WHITEPOINT_D65);

export default {
	name: "Xtreme RGB",
	long: "Xtreme RGB Color Space (Matthias Betz)",
	css: "xtreme-rgb",
	tags: ["device_rgb", "wide_gamut"],
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

		const v3 = matmul(alloc3(), XTREME_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_XTREME_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 0.7332, g: 0.3343, b: 0.1496 },
		"#00FF00": { r: 0.636, g: 0.9005, b: 0.356 },
		"#0000FF": { r: 0.389, g: 0.3758, b: 0.9443 },
		"#FFFF00": { r: 0.941, g: 0.9454, b: 0.3791 },
		"#00FFFF": { r: 0.7263, g: 0.9582, b: 0.993 },
		"#FF00FF": { r: 0.8109, g: 0.4875, b: 0.9518 },
		"#808080": { r: 0.4981, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.8189, g: 0.6507, b: 0.2655 },
	},
};
