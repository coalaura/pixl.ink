import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const EKTA_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [EKTA_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.695, 0.305],
		[0.215, 0.765],
		[0.13, 0.04],
	],
	EKTA_WP
);

const [EKTA_TO_XYZ_MATRIX, XYZ_TO_EKTA_MATRIX] = preAdaptBradford(EKTA_TO_XYZ_NATIVE, EKTA_WP, WHITEPOINT_D65);

export default {
	name: "Ekta Space PS 5",
	long: "Ekta Space PS 5 (Holmes Creative Digital)",
	css: "ekta-space-ps-5",
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

		const v3 = matmul(alloc3(), EKTA_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_EKTA_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 0.8247, g: 0.2628, b: 0.153 },
		"#00FF00": { r: 0.5816, g: 0.9657, b: 0.3512 },
		"#0000FF": { r: 0.237, g: 0.1728, b: 0.9454 },
		"#FFFF00": { r: 0.9806, g: 0.9904, b: 0.3758 },
		"#00FFFF": { r: 0.617, g: 0.9756, b: 0.9927 },
		"#FF00FF": { r: 0.8484, g: 0.306, b: 0.9532 },
		"#808080": { r: 0.4981, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.8872, g: 0.6603, b: 0.2647 },
	},
};
