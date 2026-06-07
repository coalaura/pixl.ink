import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";

const ERIMM_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [ERIMM_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.1596, 0.8404],
		[0.0366, 0.0001],
	],
	ERIMM_WP
);

const [ERIMM_TO_XYZ_MATRIX, XYZ_TO_ERIMM_MATRIX] = preAdaptBradford(ERIMM_TO_XYZ_NATIVE, ERIMM_WP, WHITEPOINT_D65);

function linearToERIMM(v) {
	if (v >= 0.001) {
		return 0.3524 * Math.log10(v) + 1.0;
	}
	return 117.47 * v;
}

function erimmToLinear(v) {
	if (v >= 0.11747) {
		return Math.pow(10, (v - 1.0) / 0.3524);
	}
	return v / 117.47;
}

export default {
	name: "ERIMM RGB",
	long: "ERIMM RGB / Extended Range Input Medium Metric RGB (ISO 22028-1)",
	css: "erimm-rgb",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = erimmToLinear(rgb.r),
			g_lin = erimmToLinear(rgb.g),
			b_lin = erimmToLinear(rgb.b);

		const v3 = matmul(alloc3(), ERIMM_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_ERIMM_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToERIMM(v3[0]),
			g = linearToERIMM(v3[1]),
			b = linearToERIMM(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.9026, g: 0.645, b: 0.3753 },
		"#00FF00": { r: 0.8305, g: 0.9793, b: 0.6726 },
		"#0000FF": { r: 0.6997, g: 0.4536, b: 0.9779 },
		"#FFFF00": { r: 0.9768, g: 0.9956, b: 0.6931 },
		"#00FFFF": { r: 0.8848, g: 0.9842, b: 0.9974 },
		"#FF00FF": { r: 0.9386, g: 0.6835, b: 0.9808 },
		"#808080": { r: 0.7654, g: 0.7654, b: 0.7654 },
		"#FFA500": { r: 0.9349, g: 0.8698, b: 0.5724 },
	},
};
