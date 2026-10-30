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

const ERIMM_MIN = 0.001;
const ERIMM_TOE = Math.E * ERIMM_MIN;
const ERIMM_LOG_RANGE = Math.log(316.2 / ERIMM_MIN);
const ERIMM_ENCODED_TOE = 1 / ERIMM_LOG_RANGE;

function linearToERIMM(v) {
	if (v > ERIMM_TOE) {
		return Math.log(v / ERIMM_MIN) / ERIMM_LOG_RANGE;
	}

	return v / (ERIMM_TOE * ERIMM_LOG_RANGE);
}

function erimmToLinear(v) {
	if (v > ERIMM_ENCODED_TOE) {
		return ERIMM_MIN * Math.exp(v * ERIMM_LOG_RANGE);
	}

	return v * ERIMM_TOE * ERIMM_LOG_RANGE;
}

export const shaderConstants = {
	ERIMM_TO_XYZ_MATRIX: ERIMM_TO_XYZ_MATRIX,
	XYZ_TO_ERIMM_MATRIX: XYZ_TO_ERIMM_MATRIX,
	ERIMM_MIN: ERIMM_MIN,
	ERIMM_TOE: ERIMM_TOE,
	ERIMM_LOG_RANGE: ERIMM_LOG_RANGE,
	ERIMM_ENCODED_TOE: ERIMM_ENCODED_TOE,
};

export default {
	name: "ERIMM RGB",
	long: "ERIMM RGB / Extended Range Input Medium Metric RGB (ISO 22028-3)",
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
		"#FFFFFF": { r: 0.545458, g: 0.545458, b: 0.545458 },
		"#FF0000": { r: 0.495186, g: 0.362292, b: 0.223155 },
		"#00FF00": { r: 0.45801, g: 0.534783, b: 0.376534 },
		"#0000FF": { r: 0.390511, g: 0.263533, b: 0.534041 },
		"#FFFF00": { r: 0.533499, g: 0.543204, b: 0.387113 },
		"#00FFFF": { r: 0.485997, g: 0.537287, b: 0.544114 },
		"#FF00FF": { r: 0.513788, g: 0.382173, b: 0.535567 },
		"#808080": { r: 0.424398, g: 0.424398, b: 0.424398 },
		"#FFA500": { r: 0.511852, g: 0.478261, b: 0.32484 },
	},
};
