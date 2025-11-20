import { alloc3, free3 } from "../pool.js";
import { clamp, makeMatrixPair, matmul, pow_sign } from "../utils.js";

const IPT_GAMMA = 0.43,
	IPT_GAMMA_INV = 1 / IPT_GAMMA;

const [XYZ_TO_LMS_IPT_MATRIX, LMS_IPT_TO_XYZ_MATRIX] = makeMatrixPair([
	[0.4002, 0.7075, -0.0807],
	[-0.228, 1.15, 0.0612],
	[0.0, 0.0, 0.9184],
]);

const [LMS_TO_IPT_MATRIX, IPT_TO_LMS_MATRIX] = makeMatrixPair([
	[0.4, 0.4, 0.2],
	[4.455, -4.851, 0.396],
	[0.8056, 0.3572, -1.1628],
]);

export default {
	name: "IPT",
	long: "IPT - Intensity-Protan-Tritan (Fairchild, 1996)",
	css: "ipt",
	tags: ["opponent_space", "perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		I: { from: 0, to: 1, step: 0.001, round: 3, name: "Intensity", primary: true },
		P: { from: -1, to: 1, step: 0.001, round: 3, name: "Protan" },
		T: { from: -1, to: 1, step: 0.001, round: 3, name: "Tritan" },
	},

	from: (ipt, out = {}) => {
		const I = ipt.I,
			P_ = (ipt.P - 0.5) * 2,
			T_ = (ipt.T - 0.5) * 2;

		const v3 = matmul(alloc3(), IPT_TO_LMS_MATRIX, I, P_, T_);

		v3[0] = pow_sign(v3[0], IPT_GAMMA_INV);
		v3[1] = pow_sign(v3[1], IPT_GAMMA_INV);
		v3[2] = pow_sign(v3[2], IPT_GAMMA_INV);

		matmul(v3, LMS_IPT_TO_XYZ_MATRIX, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LMS_IPT_MATRIX, xyz.x, xyz.y, xyz.z);

		v3[0] = pow_sign(v3[0], IPT_GAMMA);
		v3[1] = pow_sign(v3[1], IPT_GAMMA);
		v3[2] = pow_sign(v3[2], IPT_GAMMA);

		matmul(v3, LMS_TO_IPT_MATRIX, v3[0], v3[1], v3[2]);

		const I = v3[0],
			P = v3[1],
			T = v3[2];

		free3(v3);

		out.I = clamp(I, 0, 1, unclamped);
		out.P = clamp(P / 2 + 0.5, 0, 1, unclamped);
		out.T = clamp(T / 2 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { I: 0.0, P: 0.5, T: 0.5 },
		"#FFFFFF": { I: 1.0, P: 0.5, T: 0.5 },
		"#FF0000": { I: 0.4562, P: 0.8105, T: 0.7214 },
		"#00FF00": { I: 0.7604, P: 0.2733, T: 0.7654 },
		"#0000FF": { I: 0.4443, P: 0.3814, T: 0.1258 },
		"#FFFF00": { I: 0.8565, P: 0.4459, T: 0.8257 },
		"#00FFFF": { I: 0.9113, P: 0.331, T: 0.432 },
		"#FF00FF": { I: 0.6693, P: 0.7845, T: 0.3053 },
		"#808080": { I: 0.5172, P: 0.5, T: 0.5 },
		"#FFA500": { I: 0.6488, P: 0.5945, T: 0.7651 },
	},
};
