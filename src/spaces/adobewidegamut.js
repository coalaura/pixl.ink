import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, WHITEPOINT_D50, WHITEPOINT_D65 } from "../utils.js";

const [WIDE_TO_XYZ_D50] = generateMatricesFromPrimaries(
	[
		[0.735, 0.265],
		[0.115, 0.826],
		[0.157, 0.018],
	],
	WHITEPOINT_D50
);

const [WIDE_TO_XYZ_D65_MATRIX, XYZ_D65_TO_WIDE_MATRIX] = preAdaptBradford(WIDE_TO_XYZ_D50, WHITEPOINT_D50, WHITEPOINT_D65);

function wideToLinear(v) {
	if (v <= 0) {
		return 0;
	}

	return Math.pow(v, 2.2);
}

function linearToWide(v) {
	if (v <= 0) {
		return 0;
	}

	return Math.pow(v, 1 / 2.2);
}

export default {
	name: "Adobe Wide Gamut RGB",
	long: "Adobe Wide Gamut RGB (Wide Gamut RGB, D50-based primaries; gamma 2.2)",
	css: "adobe-wide-gamut-rgb",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = wideToLinear(rgb.r),
			gLin = wideToLinear(rgb.g),
			bLin = wideToLinear(rgb.b);

		const v3 = matmul(alloc3(), WIDE_TO_XYZ_D65_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_D65_TO_WIDE_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToWide(v3[0]),
			g = linearToWide(v3[1]),
			b = linearToWide(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.7887, g: 0.3436, b: 0.1318 },
		"#00FF00": { r: 0.663, g: 0.9254, b: 0.2968 },
		"#0000FF": { r: 0.0626, g: 0.2814, b: 0.9624 },
		"#FFFF00": { r: 0.9991, g: 0.9716, b: 0.3184 },
		"#00FFFF": { r: 0.6646, g: 0.9554, b: 0.9946 },
		"#FF00FF": { r: 0.79, g: 0.4307, b: 0.9679 },
		"#808080": { r: 0.4982, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.875, g: 0.6687, b: 0.225 },
	},
};
