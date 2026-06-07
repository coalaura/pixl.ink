import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";

const PRIMARIES = [
	[0.7177215, 0.3171181],
	[0.228041, 0.861569],
	[0.1005841, -0.0820452],
];

const RAW_WHITEPOINT = [0.312717, 0.3290312];

const WHITEPOINT_BMD_XYZ = [RAW_WHITEPOINT[0] / RAW_WHITEPOINT[1], 1.0, (1 - RAW_WHITEPOINT[0] - RAW_WHITEPOINT[1]) / RAW_WHITEPOINT[1]];

const [BMD_TO_XYZ_RAW] = generateMatricesFromPrimaries(PRIMARIES, WHITEPOINT_BMD_XYZ);
const [BMD_TO_XYZ_MATRIX, XYZ_TO_BMD_MATRIX] = preAdaptBradford(BMD_TO_XYZ_RAW, WHITEPOINT_BMD_XYZ, WHITEPOINT_D65);

const A = 0.08692876065491224,
	B = 0.005494072432257808,
	C = 0.5300133392291939,
	D = 8.283605932402494,
	E = 0.09246575342465753,
	LIN_CUT = 0.005,
	LOG_CUT = D * LIN_CUT + E;

function bmdFilmEncode(lin) {
	if (lin < LIN_CUT) {
		return D * lin + E;
	}
	return A * Math.log(lin + B) + C;
}

function bmdFilmDecode(log) {
	if (log < LOG_CUT) {
		return (log - E) / D;
	}
	return Math.exp((log - C) / A) - B;
}

export default {
	name: "Blackmagic Wide Gamut",
	long: "Blackmagic Wide Gamut (Film Gen 5)",
	css: "blackmagic-wide-gamut",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = bmdFilmDecode(rgb.r),
			g_lin = bmdFilmDecode(rgb.g),
			b_lin = bmdFilmDecode(rgb.b);

		const v3 = matmul(alloc3(), BMD_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_BMD_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = bmdFilmEncode(v3[0]),
			g = bmdFilmEncode(v3[1]),
			b = bmdFilmEncode(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0925, g: 0.0925, b: 0.0925 },
		"#FFFFFF": { r: 0.5305, g: 0.5305, b: 0.5305 },
		"#FF0000": { r: 0.4939, g: 0.2768, b: 0.2524 },
		"#00FF00": { r: 0.4176, g: 0.5104, b: 0.3749 },
		"#0000FF": { r: 0.3125, g: 0.3732, b: 0.5114 },
		"#FFFF00": { r: 0.5236, g: 0.5155, b: 0.3916 },
		"#00FFFF": { r: 0.439, g: 0.5262, b: 0.5274 },
		"#FF00FF": { r: 0.5034, g: 0.3957, b: 0.5152 },
		"#808080": { r: 0.3989, g: 0.3989, b: 0.3989 },
		"#FFA500": { r: 0.5063, g: 0.4393, b: 0.3317 },
	},
};
