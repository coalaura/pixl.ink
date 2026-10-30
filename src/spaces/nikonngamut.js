import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [NIKON_TO_XYZ_MATRIX, XYZ_TO_NIKON_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.708, 0.292],
		[0.17, 0.797],
		[0.131, 0.046],
	],
	WHITEPOINT_D65
);

function linearToNLog(v) {
	if (v >= 0.328) {
		return (150 * Math.log(v) + 619) / 1023;
	}

	return 650 * Math.cbrt(v + 0.0075) / 1023;
}

function nLogToLinear(v) {
	if (v >= 452 / 1023) {
		return Math.exp((1023 * v - 619) / 150);
	}

	return (1023 * v / 650) ** 3 - 0.0075;
}

export const shaderConstants = {
	NIKON_TO_XYZ_MATRIX: NIKON_TO_XYZ_MATRIX,
	XYZ_TO_NIKON_MATRIX: XYZ_TO_NIKON_MATRIX,
};

export default {
	name: "Nikon N-Gamut",
	long: "Nikon N-Gamut / N-Log Color Space",
	css: "nikon-n-gamut",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = nLogToLinear(rgb.r),
			g_lin = nLogToLinear(rgb.g),
			b_lin = nLogToLinear(rgb.b);

		const v3 = matmul(alloc3(), NIKON_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_NIKON_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToNLog(v3[0]),
			g = linearToNLog(v3[1]),
			b = linearToNLog(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.124373, g: 0.124373, b: 0.124373 },
		"#FFFFFF": { r: 0.605083, g: 0.605083, b: 0.605083 },
		"#FF0000": { r: 0.536692, g: 0.269779, b: 0.183008 },
		"#00FF00": { r: 0.442288, g: 0.592794, b: 0.290532 },
		"#0000FF": { r: 0.235304, g: 0.1691, b: 0.5889 },
		"#FFFF00": { r: 0.598594, g: 0.603409, b: 0.306272 },
		"#00FFFF": { r: 0.460389, g: 0.594593, b: 0.602659 },
		"#FF00FF": { r: 0.546478, g: 0.282504, b: 0.59156 },
		"#808080": { r: 0.385514, g: 0.385514, b: 0.385514 },
		"#FFA500": { r: 0.563137, g: 0.476148, b: 0.244592 },
	},
};
