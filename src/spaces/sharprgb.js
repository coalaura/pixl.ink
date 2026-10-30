import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";

const WHITEPOINT_E = [1, 1, 1];

const [SHARP_TO_XYZ_E] = generateMatricesFromPrimaries(
	[
		[0.6898, 0.3206],
		[0.0736, 0.9003],
		[0.1166, 0.0374],
	],
	WHITEPOINT_E
);

const [SHARP_TO_XYZ_MATRIX, XYZ_TO_SHARP_MATRIX] = preAdaptBradford(SHARP_TO_XYZ_E, WHITEPOINT_E, WHITEPOINT_D65);

export const shaderConstants = {
	SHARP_TO_XYZ_MATRIX: SHARP_TO_XYZ_MATRIX,
	XYZ_TO_SHARP_MATRIX: XYZ_TO_SHARP_MATRIX,
};

export default {
	name: "Sharp RGB",
	long: "Sharp RGB (Spectrally Sharpened, Equal-Energy White, Linear)",
	css: "sharp-rgb",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), SHARP_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_SHARP_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = v3[0],
			g = v3[1],
			b = v3[2];

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.531376, g: 0.03512, b: 0.023368 },
		"#00FF00": { r: 0.4092, g: 0.952139, b: 0.100076 },
		"#0000FF": { r: 0.059424, g: 0.012741, b: 0.876556 },
		"#FFFF00": { r: 0.940576, g: 0.987259, b: 0.123444 },
		"#00FFFF": { r: 0.468624, g: 0.96488, b: 0.976632 },
		"#FF00FF": { r: 0.5908, g: 0.047861, b: 0.899924 },
		"#808080": { r: 0.215861, g: 0.215861, b: 0.215861 },
		"#FFA500": { r: 0.685343, g: 0.393374, b: 0.061023 },
	},
};
