import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToProphoto, matmul, preAdaptBradford, prophotoToLinear, round, WHITEPOINT_D50, WHITEPOINT_D65 } from "../utils.js";

const [PROPHOTO_TO_XYZ_D50] = generateMatricesFromPrimaries(
	[
		[0.734699, 0.265301],
		[0.159597, 0.840403],
		[0.036598, 0.000105],
	],
	WHITEPOINT_D50
);

const [PROPHOTO_TO_XYZ_MATRIX, XYZ_TO_PROPHOTO_MATRIX] = preAdaptBradford(PROPHOTO_TO_XYZ_D50, WHITEPOINT_D50, WHITEPOINT_D65);

export default {
	name: "ProPhoto RGB",
	long: "ProPhoto RGB (ROMM RGB, D50, γ=1.8 Hybrid)",
	css: "prophoto-rgb",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = prophotoToLinear(rgb.r),
			gLin = prophotoToLinear(rgb.g),
			bLin = prophotoToLinear(rgb.b);

		const v3 = matmul(alloc3(), PROPHOTO_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_PROPHOTO_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToProphoto(v3[0]),
			g = linearToProphoto(v3[1]),
			b = linearToProphoto(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	format: rgb => {
		const r = round(rgb.r, 3),
			g = round(rgb.g, 3),
			b = round(rgb.b, 3);

		return `color(prophoto-rgb ${r} ${g} ${b})`;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.7023, g: 0.2757, b: 0.1035 },
		"#00FF00": { r: 0.5403, g: 0.9276, b: 0.3046 },
		"#0000FF": { r: 0.3362, g: 0.1376, b: 0.9229 },
		"#FFFF00": { r: 0.9193, g: 0.9843, b: 0.3281 },
		"#00FFFF": { r: 0.658, g: 0.9441, b: 0.9906 },
		"#FF00FF": { r: 0.8004, g: 0.3171, b: 0.9328 },
		"#808080": { r: 0.4267, g: 0.4267, b: 0.4267 },
		"#FFA500": { r: 0.7895, g: 0.6233, b: 0.2117 },
	},
};
