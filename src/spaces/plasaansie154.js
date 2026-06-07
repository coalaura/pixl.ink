import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";

const PLASA_WP = [0.4254 / 0.4044, 1.0, (1 - 0.4254 - 0.4044) / 0.4044];

const [PLASA_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.7347, 0.2653],
		[0.1596, 0.8404],
		[0.0366, 0.0001],
	],
	PLASA_WP
);

const [PLASA_TO_XYZ_MATRIX, XYZ_TO_PLASA_MATRIX] = preAdaptBradford(PLASA_TO_XYZ_NATIVE, PLASA_WP, WHITEPOINT_D65);

export default {
	name: "PLASA ANSI E1.54",
	long: "PLASA ANSI E1.54 Standard Entertainment Lighting RGB",
	css: "plasa-ansi-e1-54",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), PLASA_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_PLASA_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.5338, g: 0.108, b: 0.0127 },
		"#00FF00": { r: 0.3877, g: 0.8662, b: 0.1457 },
		"#0000FF": { r: 0.0784, g: 0.0259, b: 0.8415 },
		"#FFFF00": { r: 0.9216, g: 0.9741, b: 0.1585 },
		"#00FFFF": { r: 0.4662, g: 0.892, b: 0.9873 },
		"#FF00FF": { r: 0.6123, g: 0.1338, b: 0.8543 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2159 },
		"#FFA500": { r: 0.6797, g: 0.4339, b: 0.0676 },
	},
};
