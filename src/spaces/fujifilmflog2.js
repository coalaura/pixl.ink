import { alloc3, free3 } from "../pool.js";
import { clamp, matmul, REC2020_TO_XYZ_MATRIX, XYZ_TO_REC2020_MATRIX } from "../utils.js";

const FLOG2_A = 5.555556,
	FLOG2_B = 0.064829,
	FLOG2_C = 0.245281,
	FLOG2_D = 0.384316,
	FLOG2_E = 8.799461,
	FLOG2_F = 0.092864,
	FLOG2_CUT1 = 0.000889,
	FLOG2_CUT2 = 0.100686685370811;

function flog2Encode(lin) {
	if (lin >= FLOG2_CUT1) {
		return FLOG2_C * Math.log10(FLOG2_A * lin + FLOG2_B) + FLOG2_D;
	}

	return FLOG2_E * lin + FLOG2_F;
}

function flog2Decode(log) {
	if (log >= FLOG2_CUT2) {
		return (Math.pow(10, (log - FLOG2_D) / FLOG2_C) - FLOG2_B) / FLOG2_A;
	}

	return (log - FLOG2_F) / FLOG2_E;
}

export default {
	name: "Fujifilm F-Log2",
	long: "Fujifilm F-Log2 OETF (F-Gamut / Rec.2020)",
	css: "fujifilm-flog2",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = flog2Decode(rgb.r),
			g_lin = flog2Decode(rgb.g),
			b_lin = flog2Decode(rgb.b);

		const v3 = matmul(alloc3(), REC2020_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_REC2020_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = flog2Encode(v3[0]),
			g = flog2Encode(v3[1]),
			b = flog2Encode(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0929, g: 0.0929, b: 0.0929 },
		"#FFFFFF": { r: 0.5682, g: 0.5682, b: 0.5682 },
		"#FF0000": { r: 0.5193, g: 0.2989, b: 0.1863 },
		"#00FF00": { r: 0.4524, g: 0.5594, b: 0.3215 },
		"#0000FF": { r: 0.2579, g: 0.1652, b: 0.5566 },
		"#FFFF00": { r: 0.5636, g: 0.567, b: 0.3377 },
		"#00FFFF": { r: 0.4651, g: 0.5607, b: 0.5665 },
		"#FF00FF": { r: 0.5262, g: 0.3129, b: 0.5585 },
		"#808080": { r: 0.4093, g: 0.4093, b: 0.4093 },
		"#FFA500": { r: 0.5382, g: 0.4763, b: 0.2694 },
	},
};
