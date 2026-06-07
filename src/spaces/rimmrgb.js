import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToRec709, matmul, preAdaptBradford, rec709ToLinear, WHITEPOINT_D65 } from "../utils.js";

const RIMM_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [RIMM_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.1596, 0.8404],
		[0.0366, 0.0001],
	],
	RIMM_WP
);

const [RIMM_TO_XYZ_MATRIX, XYZ_TO_RIMM_MATRIX] = preAdaptBradford(RIMM_TO_XYZ_NATIVE, RIMM_WP, WHITEPOINT_D65);

export default {
	name: "RIMM RGB",
	long: "RIMM RGB / Reference Input Medium Metric RGB (ISO 22028-1)",
	css: "rimm-rgb",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = rec709ToLinear(rgb.r),
			g_lin = rec709ToLinear(rgb.g),
			b_lin = rec709ToLinear(rgb.b);

		const v3 = matmul(alloc3(), RIMM_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_RIMM_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToRec709(v3[0]),
			g = linearToRec709(v3[1]),
			b = linearToRec709(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.7262, g: 0.288, b: 0.076 },
		"#00FF00": { r: 0.5687, g: 0.9351, b: 0.3207 },
		"#0000FF": { r: 0.3555, g: 0.1214, b: 0.9308 },
		"#FFFF00": { r: 0.9276, g: 0.986, b: 0.3468 },
		"#00FFFF": { r: 0.6841, g: 0.95, b: 0.9916 },
		"#FF00FF": { r: 0.8185, g: 0.3344, b: 0.9398 },
		"#808080": { r: 0.4523, g: 0.4523, b: 0.4523 },
		"#FFA500": { r: 0.8084, g: 0.6504, b: 0.2136 },
	},
};
