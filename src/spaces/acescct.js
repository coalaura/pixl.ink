import { alloc3, free3 } from "../pool.js";
import { AP1_TO_XYZ_MATRIX, clamp, matmul, XYZ_TO_AP1_MATRIX } from "../utils.js";

const CCT_MIN = 0.0729055341958355,
	C1 = 0.0078125,
	C2 = 10.5402377416545,
	C3 = 0.155251141552511;

const CCT_MAX = (Math.log2(65504) + 9.72) / 17.52;

function normToCct(v) {
	return CCT_MIN + v * (CCT_MAX - CCT_MIN);
}

function cctToNorm(code) {
	return (code - CCT_MIN) / (CCT_MAX - CCT_MIN);
}

function acescctToLinearAP1(code) {
	if (code <= C3) {
		return (code - CCT_MIN) / C2;
	}

	if (code < CCT_MAX) {
		return Math.pow(2, code * 17.52 - 9.72);
	}

	return 65504;
}

function linearAP1ToAcescct(linear) {
	if (linear <= C1) {
		return C2 * linear + CCT_MIN;
	}

	return (Math.log2(linear) + 9.72) / 17.52;
}

export default {
	name: "ACEScct",
	long: "ACEScct - Quasi-log ACES encoding (AP1, D60)",
	css: "acescct",
	tags: ["device_rgb", "log_curve", "transfer_encoding"],
	base: "ACES AP1",
	ui: {
		r: { from: CCT_MIN, to: CCT_MAX, step: 0.001, round: 3, name: "Red" },
		g: { from: CCT_MIN, to: CCT_MAX, step: 0.001, round: 3, name: "Green" },
		b: { from: CCT_MIN, to: CCT_MAX, step: 0.001, round: 3, name: "Blue" },
	},

	from: (acescct, out = {}) => {
		const v3 = alloc3();

		const rc = normToCct(acescct.r),
			gc = normToCct(acescct.g),
			bc = normToCct(acescct.b);

		const rLin = acescctToLinearAP1(rc),
			gLin = acescctToLinearAP1(gc),
			bLin = acescctToLinearAP1(bc);

		matmul(v3, AP1_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = alloc3();

		matmul(v3, XYZ_TO_AP1_MATRIX, xyz.x, xyz.y, xyz.z);

		const rc = linearAP1ToAcescct(v3[0]),
			gc = linearAP1ToAcescct(v3[1]),
			bc = linearAP1ToAcescct(v3[2]);

		const r = cctToNorm(rc),
			g = cctToNorm(gc),
			b = cctToNorm(bc);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 0.3454, g: 0.3454, b: 0.3454 },
		"#FF0000": { r: 0.3165, g: 0.1886, b: 0.1163 },
		"#00FF00": { r: 0.2817, g: 0.3403, b: 0.2149 },
		"#0000FF": { r: 0.1654, g: 0.0911, b: 0.3372 },
		"#FFFF00": { r: 0.3426, g: 0.3446, b: 0.2251 },
		"#00FFFF": { r: 0.2894, g: 0.3411, b: 0.3442 },
		"#FF00FF": { r: 0.3209, g: 0.199, b: 0.3386 },
		"#808080": { r: 0.2549, g: 0.2549, b: 0.2549 },
		"#FFA500": { r: 0.3277, g: 0.2935, b: 0.1811 },
	},
};
