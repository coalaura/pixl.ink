import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, preAdaptBradford, spow, WHITEPOINT_C, WHITEPOINT_D65 } from "../utils.js";

const [BT470_525_TO_XYZ_NATIVE] = generateMatricesFromPrimaries(
	[
		[0.67, 0.33],
		[0.21, 0.71],
		[0.14, 0.08],
	],
	WHITEPOINT_C
);

const [BT470_525_TO_XYZ_MATRIX, XYZ_TO_BT470_525_MATRIX] = preAdaptBradford(BT470_525_TO_XYZ_NATIVE, WHITEPOINT_C, WHITEPOINT_D65);

export default {
	name: "BT.470 525-line",
	long: "ITU-R BT.470 System M (525-line, historical NTSC 1953, Illuminant C)",
	css: "bt470-525",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 255, step: 1, round: 0, name: "Red" },
		g: { from: 0, to: 255, step: 1, round: 0, name: "Green" },
		b: { from: 0, to: 255, step: 1, round: 0, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 2.2),
			g_lin = spow(rgb.g, 2.2),
			b_lin = spow(rgb.b, 2.2);

		const v3 = matmul(alloc3(), BT470_525_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_BT470_525_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 0.8382, g: 0.1548, b: 0.1607 },
		"#00FF00": { r: 0.5685, g: 1.0233, b: 0.2578 },
		"#0000FF": { r: 0.2126, g: -0.2955, b: 0.9682 },
		"#FFFF00": { r: 0.9848, g: 1.0305, b: 0.2958 },
		"#00FFFF": { r: 0.5973, g: 0.9925, b: 0.9918 },
		"#FF00FF": { r: 0.8566, g: -0.2606, b: 0.9766 },
		"#808080": { r: 0.4981, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.8967, g: 0.6685, b: 0.2234 },
	},
};
