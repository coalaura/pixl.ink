import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, pow_sign, preAdaptBradford, WHITEPOINT_D65, WHITEPOINT_E } from "../utils.js";

const GAMMA = 2.2,
	GAMMA_INV = 1 / 2.2;

const [CIERGB_TO_XYZ_E] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.2738, 0.7174],
		[0.1666, 0.0089],
	],
	WHITEPOINT_E
);

const [CIERGB_TO_XYZ_MATRIX, XYZ_TO_CIERGB_MATRIX] = preAdaptBradford(CIERGB_TO_XYZ_E, WHITEPOINT_E, WHITEPOINT_D65);

function cieRgbToLinear(v) {
	return pow_sign(v, GAMMA);
}

function linearToCieRgb(v) {
	return pow_sign(v, GAMMA_INV);
}

export default {
	name: "CIE RGB",
	long: "CIE 1931 RGB (Imaginary primaries, Illuminant E → D65 via Bradford)",
	css: "cie-rgb",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	unbounded: true,
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = cieRgbToLinear(rgb.r),
			gLin = cieRgbToLinear(rgb.g),
			bLin = cieRgbToLinear(rgb.b);

		const v3 = matmul(alloc3(), CIERGB_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_CIERGB_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToCieRgb(v3[0]),
			g = linearToCieRgb(v3[1]),
			b = linearToCieRgb(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0001, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.9182, g: 0.3406, b: 0.1549 },
		"#00FF00": { r: 0.523, g: 0.9131, b: 0.3564 },
		"#0000FF": { r: -0.2966, g: 0.3309, b: 0.9436 },
		"#FFFF00": { r: 1.0309, g: 0.9591, b: 0.3813 },
		"#00FFFF": { r: 0.4484, g: 0.9563, b: 0.9924 },
		"#FF00FF": { r: 0.8827, g: 0.4601, b: 0.9516 },
		"#808080": { r: 0.4982, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.9625, g: 0.6605, b: 0.2685 },
	},
};
