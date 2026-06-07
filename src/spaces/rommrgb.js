import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToProphoto, matmul, preAdaptBradford, prophotoToLinear, WHITEPOINT_D65 } from "../utils.js";

const ROMM_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [ROMM_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.1596, 0.8404],
		[0.0366, 0.0001],
	],
	ROMM_WP
);

const [ROMM_TO_XYZ_MATRIX, XYZ_TO_ROMM_MATRIX] = preAdaptBradford(ROMM_TO_XYZ_NATIVE, ROMM_WP, WHITEPOINT_D65);

export default {
	name: "ROMM RGB",
	long: "ROMM RGB / ProPhoto RGB Space (ISO 22028-1)",
	css: "romm-rgb",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = prophotoToLinear(rgb.r),
			g_lin = prophotoToLinear(rgb.g),
			b_lin = prophotoToLinear(rgb.b);

		const v3 = matmul(alloc3(), ROMM_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_ROMM_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToProphoto(v3[0]),
			g = linearToProphoto(v3[1]),
			b = linearToProphoto(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.7021, g: 0.2756, b: 0.1036 },
		"#00FF00": { r: 0.5405, g: 0.9276, b: 0.3047 },
		"#0000FF": { r: 0.3362, g: 0.1376, b: 0.9228 },
		"#FFFF00": { r: 0.9193, g: 0.9843, b: 0.3282 },
		"#00FFFF": { r: 0.6581, g: 0.9441, b: 0.9906 },
		"#FF00FF": { r: 0.8003, g: 0.317, b: 0.9328 },
		"#808080": { r: 0.4267, g: 0.4267, b: 0.4267 },
		"#FFA500": { r: 0.7894, g: 0.6233, b: 0.2118 },
	},
};
