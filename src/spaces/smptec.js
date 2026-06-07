import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, spow, WHITEPOINT_D65 } from "../utils.js";

const [SMPTEC_TO_XYZ_MATRIX, XYZ_TO_SMPTEC_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.63, 0.34],
		[0.31, 0.595],
		[0.155, 0.07],
	],
	WHITEPOINT_D65
);

export default {
	name: "SMPTE-C",
	long: "SMPTE-C RGB (D65, Gamma 2.2)",
	css: "smpte-c",
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

		const v3 = matmul(alloc3(), SMPTEC_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_SMPTEC_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 1.0292, g: -0.1675, b: 0.0541 },
		"#00FF00": { r: -0.2686, g: 1.0164, b: 0.085 },
		"#0000FF": { r: -0.1231, g: -0.1557, b: 0.9972 },
		"#FFFF00": { r: 1.0045, g: 1.0076, b: 0.0981 },
		"#00FFFF": { r: -0.2895, g: 1.0089, b: 0.9993 },
		"#FF00FF": { r: 1.0248, g: -0.2216, b: 0.998 },
		"#808080": { r: 0.4981, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 1.02, g: 0.6366, b: 0.0744 },
	},
};
