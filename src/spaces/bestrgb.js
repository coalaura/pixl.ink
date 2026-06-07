import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const BEST_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [BEST_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.215, 0.775],
		[0.13, 0.035],
	],
	BEST_WP
);

const [BEST_TO_XYZ_MATRIX, XYZ_TO_BEST_MATRIX] = preAdaptBradford(BEST_TO_XYZ_NATIVE, BEST_WP, WHITEPOINT_D65);

export default {
	name: "Best RGB",
	long: "Best RGB Color Space (Matthias Betz)",
	css: "best-rgb",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 2.0),
			g_lin = spow(rgb.g, 2.0),
			b_lin = spow(rgb.b, 2.0);

		const v3 = matmul(alloc3(), BEST_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_BEST_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 2.0),
			g = spow(v3[1], 1 / 2.0),
			b = spow(v3[2], 1 / 2.0);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.8086, g: 0.3134, b: 0.1262 },
		"#00FF00": { r: 0.5522, g: 0.9343, b: 0.33 },
		"#0000FF": { r: 0.2028, g: 0.1699, b: 0.9355 },
		"#FFFF00": { r: 0.9792, g: 0.9855, b: 0.3534 },
		"#00FFFF": { r: 0.5883, g: 0.9496, b: 0.992 },
		"#FF00FF": { r: 0.8337, g: 0.3565, b: 0.944 },
		"#808080": { r: 0.4646, g: 0.4646, b: 0.4646 },
		"#FFA500": { r: 0.8767, g: 0.6532, b: 0.2386 },
	},
};
