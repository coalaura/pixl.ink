import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, spow, WHITEPOINT_D65 } from "../utils.js";

const [PAL_TO_XYZ_MATRIX, XYZ_TO_PAL_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.64, 0.33],
		[0.29, 0.6],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export default {
	name: "PAL/SECAM",
	long: "PAL/SECAM System B/G (Modern specifications, Gamma 2.2)",
	css: "pal-secam",
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

		const v3 = matmul(alloc3(), PAL_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_PAL_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 0.9806, g: 0, b: 0 },
		"#00FF00": { r: 0.2373, g: 1, b: -0.1337 },
		"#0000FF": { r: 0, g: 0, b: 1.0054 },
		"#FFFF00": { r: 1, g: 1, b: -0.1337 },
		"#00FFFF": { r: 0.2373, g: 1, b: 1 },
		"#FF00FF": { r: 0.9806, g: 0, b: 1.0054 },
		"#808080": { r: 0.4981, g: 0.4981, b: 0.4981 },
		"#FFA500": { r: 0.9879, g: 0.6413, b: -0.0857 },
	},
};
