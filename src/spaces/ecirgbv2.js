import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, spow, preAdaptBradford, WHITEPOINT_D50, WHITEPOINT_D65 } from "../utils.js";

const ECI_GAMMA = 2.2;
const ECI_INV_GAMMA = 1 / ECI_GAMMA;

const [ECI_TO_XYZ_D50] = generateMatricesFromPrimaries(
	[
		[0.67, 0.33],
		[0.21, 0.71],
		[0.14, 0.08],
	],
	WHITEPOINT_D50
);

const [ECI_TO_XYZ_MATRIX, XYZ_TO_ECI_MATRIX] = preAdaptBradford(ECI_TO_XYZ_D50, WHITEPOINT_D50, WHITEPOINT_D65);

function eciToLinear(v) {
	return spow(v, ECI_GAMMA);
}

function linearToEci(v) {
	return spow(v, ECI_INV_GAMMA);
}

export default {
	name: "ECI RGB v2",
	long: "ECI RGB v2 (D50, γ=2.2)",
	css: "eci-rgb-v2",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r = eciToLinear(rgb.r),
			g = eciToLinear(rgb.g),
			b = eciToLinear(rgb.b);

		const v3 = matmul(alloc3(), ECI_TO_XYZ_MATRIX, r, g, b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_ECI_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToEci(v3[0]),
			g = linearToEci(v3[1]),
			b = linearToEci(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.83, g: 0.146, b: 0.157 },
		"#00FF00": { r: 0.582, g: 1.011, b: 0.222 },
		"#0000FF": { r: 0.212, g: -0.229, b: 0.975 },
		"#FFFF00": { r: 0.985, g: 1.017, b: 0.264 },
		"#00FFFF": { r: 0.61, g: 0.993, b: 0.992 },
		"#FF00FF": { r: 0.848, g: -0.185, b: 0.983 },
		"#808080": { r: 0.498, g: 0.498, b: 0.498 },
		"#FFA500": { r: 0.892, g: 0.659, b: 0.205 },
	},
};
