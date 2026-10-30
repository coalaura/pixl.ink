import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, WHITEPOINT_D50, WHITEPOINT_D65 } from "../utils.js";

const [ECI_TO_XYZ_D50] = generateMatricesFromPrimaries(
	[
		[0.67010309278, 0.3298969072],
		[0.20990566038, 0.70990566038],
		[0.14006179197, 0.08032955716],
	],
	WHITEPOINT_D50
);

const [ECI_TO_XYZ_MATRIX, XYZ_TO_ECI_MATRIX] = preAdaptBradford(ECI_TO_XYZ_D50, WHITEPOINT_D50, WHITEPOINT_D65);

function eciToLinear(v) {
	return v <= 0.08 ? v * 2700 / 24389 : ((100 * v + 16) / 116) ** 3;
}

function linearToEci(v) {
	return v <= 216 / 24389 ? v * 24389 / 2700 : (116 * Math.cbrt(v) - 16) / 100;
}

export const shaderConstants = {
	ECIRGBV2_TO_XYZ_MATRIX: ECI_TO_XYZ_MATRIX,
	XYZ_TO_ECIRGBV2_MATRIX: XYZ_TO_ECI_MATRIX,
};

export default {
	name: "ECI RGB v2",
	long: "ECI RGB v2 (D50, CIE L* encoding)",
	css: "eci-rgb-v2",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r = eciToLinear(rgb.r),
			g = eciToLinear(rgb.g),
			b = eciToLinear(rgb.b);

		const v3 = matmul(alloc3(), ECI_TO_XYZ_MATRIX, r, g, b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_ECI_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToEci(v3[0]),
			g = linearToEci(v3[1]),
			b = linearToEci(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.851401, g: 0.124982, b: 0.138641 },
		"#00FF00": { r: 0.620327, g: 1.009425, b: 0.223999 },
		"#0000FF": { r: 0.211207, g: -0.35591, b: 0.978997 },
		"#FFFF00": { r: 0.987188, g: 1.015039, b: 0.276658 },
		"#00FFFF": { r: 0.64738, g: 0.994238, b: 0.993364 },
		"#FF00FF": { r: 0.867802, g: -0.221971, b: 0.9858 },
		"#808080": { r: 0.53585, g: 0.53585, b: 0.53585 },
		"#FFA500": { r: 0.906593, g: 0.694935, b: 0.203272 },
	},
};
