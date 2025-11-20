import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, pow_sign, preAdaptBradford, WHITEPOINT_C, WHITEPOINT_D65 } from "../utils.js";

const NTSC_GAMMA = 2.2;

const [NTSC_TO_XYZ_C] = generateMatricesFromPrimaries(
	[
		[0.67, 0.33],
		[0.21, 0.71],
		[0.14, 0.08],
	],
	WHITEPOINT_C
);

const [NTSC_TO_XYZ_MATRIX, XYZ_TO_NTSC_MATRIX] = preAdaptBradford(NTSC_TO_XYZ_C, WHITEPOINT_C, WHITEPOINT_D65);

function ntscToLinear(v) {
	return pow_sign(v, NTSC_GAMMA);
}

function linearToNtsc(v) {
	return pow_sign(v, 1 / NTSC_GAMMA);
}

export default {
	name: "NTSC 1953",
	long: "NTSC 1953 RGB (Illuminant C, γ≈2.2 CRT)",
	css: "ntsc-1953",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = ntscToLinear(rgb.r),
			gLin = ntscToLinear(rgb.g),
			bLin = ntscToLinear(rgb.b);

		const v3 = matmul(alloc3(), NTSC_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_NTSC_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToNtsc(v3[0]),
			g = linearToNtsc(v3[1]),
			b = linearToNtsc(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.8367, g: 0.1529, b: 0.1614 },
		"#00FF00": { r: 0.5703, g: 1.0221, b: 0.2576 },
		"#0000FF": { r: 0.2148, g: -0.2954, b: 0.9663 },
		"#FFFF00": { r: 0.9845, g: 1.0292, b: 0.2957 },
		"#00FFFF": { r: 0.5997, g: 0.9927, b: 0.9917 },
		"#FF00FF": { r: 0.8555, g: -0.2605, b: 0.9748 },
		"#808080": { r: 0.4982, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.8957, g: 0.6674, b: 0.2278 },
	},
};
