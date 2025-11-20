import { alloc3, free3 } from "../pool.js";
import { AP1_TO_XYZ_MATRIX, clamp, matmul, XYZ_TO_AP1_MATRIX } from "../utils.js";

const C1 = 2 ** -16,
	C2 = 2 ** -15,
	LOG2_CONSTANT = 17.52,
	MID_GRAY_CONSTANT = 9.72;

const CC_MIN = (Math.log2(C1) + MID_GRAY_CONSTANT) / LOG2_CONSTANT,
	CC_MAX = (Math.log2(65504) + MID_GRAY_CONSTANT) / LOG2_CONSTANT,
	CC_RANGE = CC_MAX - CC_MIN;

function acesccToLinear(acescc) {
	const cc = acescc * CC_RANGE + CC_MIN;

	if (cc <= CC_MIN) {
		return (2 ** (cc * LOG2_CONSTANT - MID_GRAY_CONSTANT) - C1) * 2.0;
	}

	if (cc < CC_MAX) {
		return 2 ** (cc * LOG2_CONSTANT - MID_GRAY_CONSTANT);
	}

	return 65504.0;
}

function linearToAcescc(linear) {
	let cc;

	if (linear <= 0) {
		cc = (Math.log2(C1) + MID_GRAY_CONSTANT) / LOG2_CONSTANT;
	} else if (linear < C2) {
		cc = (Math.log2(C1 + linear * 0.5) + MID_GRAY_CONSTANT) / LOG2_CONSTANT;
	} else {
		cc = (Math.log2(linear) + MID_GRAY_CONSTANT) / LOG2_CONSTANT;
	}

	return (cc - CC_MIN) / CC_RANGE;
}

export default {
	name: "ACEScc",
	long: "ACEScc - Academy Color Encoding System Log (AP1, D60)",
	css: "acescc",
	tags: ["device_rgb", "log_curve", "transfer_encoding"],
	base: "ACES AP1",
	ui: {
		r: { from: CC_MIN, to: CC_MAX, step: 0.001, round: 3, name: "Red" },
		g: { from: CC_MIN, to: CC_MAX, step: 0.001, round: 3, name: "Green" },
		b: { from: CC_MIN, to: CC_MAX, step: 0.001, round: 3, name: "Blue" },
	},

	from: (acescc, out = {}) => {
		const rLin = acesccToLinear(acescc.r),
			gLin = acesccToLinear(acescc.g),
			bLin = acesccToLinear(acescc.b);

		const v3 = matmul(alloc3(), AP1_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_AP1_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(linearToAcescc(v3[0]), 0, 1, unclamped);
		out.g = clamp(linearToAcescc(v3[1]), 0, 1, unclamped);
		out.b = clamp(linearToAcescc(v3[2]), 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 0.5, g: 0.5, b: 0.5 },
		"#FF0000": { r: 0.478, g: 0.3802, b: 0.325 },
		"#00FF00": { r: 0.4513, g: 0.4961, b: 0.4003 },
		"#0000FF": { r: 0.3625, g: 0.3058, b: 0.4937 },
		"#FFFF00": { r: 0.4978, g: 0.4994, b: 0.4081 },
		"#00FFFF": { r: 0.4572, g: 0.4967, b: 0.4991 },
		"#FF00FF": { r: 0.4813, g: 0.3881, b: 0.4948 },
		"#808080": { r: 0.4309, g: 0.4309, b: 0.4309 },
		"#FFA500": { r: 0.4865, g: 0.4604, b: 0.3745 },
	},
};
