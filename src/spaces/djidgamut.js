import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [DJI_TO_XYZ_MATRIX, XYZ_TO_DJI_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.71, 0.31],
		[0.21, 0.88],
		[0.09, -0.08],
	],
	WHITEPOINT_D65
);

const DJI_CUT1 = 0.014,
	DJI_A = 0.9892,
	DJI_B = 0.0108,
	DJI_C = 0.3,
	DJI_D = 0.58,
	DJI_LOG_CUT = DJI_C * Math.log10(DJI_CUT1 * DJI_A + DJI_B) + DJI_D,
	DJI_F = 0.0929,
	DJI_E = (DJI_LOG_CUT - DJI_F) / DJI_CUT1;

function linearToDLog(v) {
	const val = Math.abs(v),
		log = val >= DJI_CUT1 ? DJI_C * Math.log10(val * DJI_A + DJI_B) + DJI_D : DJI_E * val + DJI_F;

	return v >= 0 ? log : DJI_F * 2 - log;
}

function dLogToLinear(v) {
	const val = v >= DJI_F ? v : DJI_F * 2 - v,
		lin = val >= DJI_LOG_CUT ? (Math.pow(10, (val - DJI_D) / DJI_C) - DJI_B) / DJI_A : (val - DJI_F) / DJI_E;

	return v >= DJI_F ? lin : -lin;
}

export default {
	name: "DJI D-Gamut",
	long: "DJI D-Gamut / D-Log Cinema Color System",
	css: "dji-d-gamut",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = dLogToLinear(rgb.r),
			g_lin = dLogToLinear(rgb.g),
			b_lin = dLogToLinear(rgb.b);

		const v3 = matmul(alloc3(), DJI_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_DJI_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToDLog(v3[0]),
			g = linearToDLog(v3[1]),
			b = linearToDLog(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0929, g: 0.0929, b: 0.0929 },
		"#FFFFFF": { r: 0.58, g: 0.58, b: 0.58 },
		"#FF0000": { r: 0.5178, g: 0.215, b: 0.1596 },
		"#00FF00": { r: 0.4203, g: 0.5511, b: 0.3488 },
		"#0000FF": { r: 0.2897, g: 0.3409, b: 0.5529 },
		"#FFFF00": { r: 0.5667, g: 0.559, b: 0.3693 },
		"#00FFFF": { r: 0.4575, g: 0.5733, b: 0.5762 },
		"#FF00FF": { r: 0.5367, g: 0.3763, b: 0.5575 },
		"#808080": { r: 0.3853, g: 0.3853, b: 0.3853 },
		"#FFA500": { r: 0.5384, g: 0.4462, b: 0.2793 },
	},
};
