import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const BETA_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [BETA_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.6888, 0.3112],
		[0.1979, 0.7534],
		[0.1498, 0.0603],
	],
	BETA_WP
);

const [BETA_TO_XYZ_MATRIX, XYZ_TO_BETA_MATRIX] = preAdaptBradford(BETA_TO_XYZ_NATIVE, BETA_WP, WHITEPOINT_D65);

export default {
	name: "Beta RGB",
	long: "Beta RGB Color Space (Bruce Lindbloom)",
	css: "beta-rgb",
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

		const v3 = matmul(alloc3(), BETA_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_BETA_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 0.8279, g: 0.2436, b: 0.15 },
		"#00FF00": { r: 0.6036, g: 0.9773, b: 0.3046 },
		"#0000FF": { r: 0.127, g: 0.0867, b: 0.9587 },
		"#FFFF00": { r: 0.9951, g: 0.9979, b: 0.3322 },
		"#00FFFF": { r: 0.6124, g: 0.9794, b: 0.993 },
		"#FF00FF": { r: 0.834, g: 0.2547, b: 0.9661 },
		"#808080": { r: 0.4981, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.8952, g: 0.6612, b: 0.239 },
	},
};
