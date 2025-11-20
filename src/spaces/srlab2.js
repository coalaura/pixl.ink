import { alloc3, free3 } from "../pool.js";
import { clamp, fLab, fLabInv, LINEAR_RGB_TO_XYZ_MATRIX, makeMatrixPair, matmul, XYZ_TO_LINEAR_RGB_MATRIX } from "../utils.js";

const [RGB_TO_LMS, LMS_TO_RGB] = makeMatrixPair([
	[0.32053, 0.63692, 0.04256],
	[0.161987, 0.756636, 0.081376],
	[0.017228, 0.10866, 0.874112],
]);

const [LMS_PRIME_TO_LAB, LAB_TO_LMS_PRIME] = makeMatrixPair([
	[37.095, 62.9054, -0.0008],
	[663.4684, -750.5078, 87.0328],
	[63.9569, 108.4576, -172.4152],
]);

export default {
	name: "SRLab2",
	long: "SRLab2 (Standard R-Lab) - Improved perceptual uniformity over CIELAB",
	css: "srlab2",
	tags: ["perceptual_uniform", "opponent_space"],
	base: "CIECAM02",
	ui: {
		l: { from: 0, to: 100, step: 0.1, round: 1, name: "Lightness", primary: true },
		a: { from: -100, to: 100, step: 0.1, round: 1, name: "a" },
		b: { from: -100, to: 100, step: 0.1, round: 1, name: "b" },
	},

	from: (lab, out = {}) => {
		const L = lab.l * 100,
			a = (lab.a - 0.5) * 200,
			b = (lab.b - 0.5) * 200;

		const v3 = matmul(alloc3(), LAB_TO_LMS_PRIME, L, a, b);

		v3[0] = fLabInv((v3[0] + 0.16) / 1.16);
		v3[1] = fLabInv((v3[1] + 0.16) / 1.16);
		v3[2] = fLabInv((v3[2] + 0.16) / 1.16);

		matmul(v3, LMS_TO_RGB, v3[0], v3[1], v3[2]);

		matmul(v3, LINEAR_RGB_TO_XYZ_MATRIX, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LINEAR_RGB_MATRIX, xyz.x, xyz.y, xyz.z);

		matmul(v3, RGB_TO_LMS, v3[0], v3[1], v3[2]);

		v3[0] = 1.16 * fLab(v3[0]) - 0.16;
		v3[1] = 1.16 * fLab(v3[1]) - 0.16;
		v3[2] = 1.16 * fLab(v3[2]) - 0.16;

		matmul(v3, LMS_PRIME_TO_LAB, v3[0], v3[1], v3[2]);

		out.l = clamp(v3[0] / 100, 0, 1, unclamped);
		out.a = clamp(v3[1] / 200 + 0.5, 0, 1, unclamped);
		out.b = clamp(v3[2] / 200 + 0.5, 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.5323, a: 0.891, b: 0.8385 },
		"#00FF00": { l: 0.8752, a: 0.0852, b: 0.9152 },
		"#0000FF": { l: 0.3064, a: 0.4399, b: -0.054 },
		"#FFFF00": { l: 0.9735, a: 0.3142, b: 0.9759 },
		"#00FFFF": { l: 0.9062, a: 0.281, b: 0.425 },
		"#FF00FF": { l: 0.6026, a: 1.0134, b: 0.195 },
		"#808080": { l: 0.5358, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.7525, a: 0.5402, b: 0.8993 },
	},
};
