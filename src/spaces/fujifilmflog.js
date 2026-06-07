import { alloc3, free3 } from "../pool.js";
import { clamp, matmul, REC2020_TO_XYZ_MATRIX, XYZ_TO_REC2020_MATRIX } from "../utils.js";

const FLOG_A = 0.555556,
	FLOG_B = 0.009468,
	FLOG_C = 0.344676,
	FLOG_D = 0.790453,
	FLOG_E = 8.735631,
	FLOG_F = 0.092864,
	FLOG_CUT1 = 0.00089,
	FLOG_CUT2 = 0.100537775223865;

function flogEncode(lin) {
	if (lin >= FLOG_CUT1) {
		return FLOG_C * Math.log10(FLOG_A * lin + FLOG_B) + FLOG_D;
	}

	return FLOG_E * lin + FLOG_F;
}

function flogDecode(log) {
	if (log >= FLOG_CUT2) {
		return (Math.pow(10, (log - FLOG_D) / FLOG_C) - FLOG_B) / FLOG_A;
	}

	return (log - FLOG_F) / FLOG_E;
}

export default {
	name: "Fujifilm F-Log",
	long: "Fujifilm F-Log OETF (F-Gamut / Rec.2020)",
	css: "fujifilm-flog",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = flogDecode(rgb.r),
			g_lin = flogDecode(rgb.g),
			b_lin = flogDecode(rgb.b);

		const v3 = matmul(alloc3(), REC2020_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_REC2020_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = flogEncode(v3[0]),
			g = flogEncode(v3[1]),
			b = flogEncode(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0929, g: 0.0929, b: 0.0929 },
		"#FFFFFF": { r: 0.705, g: 0.705, b: 0.705 },
		"#FF0000": { r: 0.6367, g: 0.3354, b: 0.1938 },
		"#00FF00": { r: 0.5438, g: 0.6927, b: 0.3653 },
		"#0000FF": { r: 0.2822, g: 0.1693, b: 0.6888 },
		"#FFFF00": { r: 0.6985, g: 0.7033, b: 0.387 },
		"#00FFFF": { r: 0.5614, g: 0.6945, b: 0.7026 },
		"#FF00FF": { r: 0.6464, g: 0.3539, b: 0.6914 },
		"#808080": { r: 0.4843, g: 0.4843, b: 0.4843 },
		"#FFA500": { r: 0.663, g: 0.5769, b: 0.2969 },
	},
};
