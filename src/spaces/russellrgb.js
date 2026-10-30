import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const RUSSELL_WP = [0.33243 / 0.34744, 1, (1 - 0.33243 - 0.34744) / 0.34744];
const [RUSSELL_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.69, 0.31],
		[0.18, 0.77],
		[0.1, 0.02],
	],
	RUSSELL_WP
);

const [RUSSELL_TO_XYZ_MATRIX, XYZ_TO_RUSSELL_MATRIX] = preAdaptBradford(RUSSELL_TO_XYZ_NATIVE, RUSSELL_WP, WHITEPOINT_D65);

export const shaderConstants = {
	RUSSELL_TO_XYZ_MATRIX: RUSSELL_TO_XYZ_MATRIX,
	XYZ_TO_RUSSELL_MATRIX: XYZ_TO_RUSSELL_MATRIX,
};

export default {
	name: "Russell RGB",
	long: "Russell RGB Color Space (Russell Cottrell, D55)",
	css: "russell-rgb",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 2.2),
			g_lin = spow(rgb.g, 2.2),
			b_lin = spow(rgb.b, 2.2);

		const v3 = matmul(alloc3(), RUSSELL_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_RUSSELL_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 2.2),
			g = spow(v3[1], 1 / 2.2),
			b = spow(v3[2], 1 / 2.2);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.789875, g: 0.246429, b: 0.152041 },
		"#00FF00": { r: 0.593539, g: 0.965378, b: 0.306962 },
		"#0000FF": { r: 0.330374, g: 0.19908, b: 0.957912 },
		"#FFFF00": { r: 0.959252, g: 0.986852, b: 0.335143 },
		"#00FFFF": { r: 0.662973, g: 0.978873, b: 0.992759 },
		"#FF00FF": { r: 0.840669, g: 0.307312, b: 0.965467 },
		"#808080": { r: 0.49814, g: 0.49814, b: 0.49814 },
		"#FFA500": { r: 0.858337, g: 0.654905, b: 0.241399 },
	},
};
