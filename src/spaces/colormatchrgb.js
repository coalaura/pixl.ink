import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const COLORMATCH_WP = [0.3457 / 0.3585, 1.0, (1 - 0.3457 - 0.3585) / 0.3585];

const [COLORMATCH_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.63, 0.34],
		[0.295, 0.605],
		[0.15, 0.075],
	],
	COLORMATCH_WP
);

const [COLORMATCH_TO_XYZ_MATRIX, XYZ_TO_COLORMATCH_MATRIX] = preAdaptBradford(COLORMATCH_TO_XYZ_NATIVE, COLORMATCH_WP, WHITEPOINT_D65);

export default {
	name: "ColorMatch RGB",
	long: "ColorMatch RGB (Radius PressView Studio Standard)",
	css: "colormatch-rgb",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 1.8),
			g_lin = spow(rgb.g, 1.8),
			b_lin = spow(rgb.b, 1.8);

		const v3 = matmul(alloc3(), COLORMATCH_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_COLORMATCH_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 1.8),
			g = spow(v3[1], 1 / 1.8),
			b = spow(v3[2], 1 / 1.8);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.9279, g: -0.1332, b: -0.0601 },
		"#00FF00": { r: 0.2826, g: 1.0272, b: -0.1377 },
		"#0000FF": { r: 0.1236, g: -0.1227, b: 1.019 },
		"#FFFF00": { r: 0.987, g: 1.0127, b: -0.1541 },
		"#00FFFF": { r: 0.3164, g: 1.0147, b: 1.0035 },
		"#FF00FF": { r: 0.9415, g: -0.1882, b: 1.0156 },
		"#808080": { r: 0.4267, g: 0.4267, b: 0.4267 },
		"#FFA500": { r: 0.9505, g: 0.5741, b: -0.1038 },
	},
};
