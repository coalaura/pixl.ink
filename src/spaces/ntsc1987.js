import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToRec709, matmul, rec709ToLinear, WHITEPOINT_D65 } from "../utils.js";

// NTSC 1987 is defined with SMPTE-C primaries and D65 whitepoint
const [NTSC_TO_XYZ_MATRIX, XYZ_TO_NTSC_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.63, 0.34],
		[0.31, 0.595],
		[0.155, 0.07],
	],
	WHITEPOINT_D65
);

export default {
	name: "NTSC 1987",
	long: "NTSC 1987 (SMPTE-C) RGB Color Space",
	css: "ntsc-1987",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 255, step: 1, round: 0, name: "Red" },
		g: { from: 0, to: 255, step: 1, round: 0, name: "Green" },
		b: { from: 0, to: 255, step: 1, round: 0, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = rec709ToLinear(rgb.r),
			g_lin = rec709ToLinear(rgb.g),
			b_lin = rec709ToLinear(rgb.b);

		const v3 = matmul(alloc3(), NTSC_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_NTSC_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 1.0318, g: -0.0883, b: 0.0073 },
		"#00FF00": { r: -0.2495, g: 1.0178, b: 0.0199 },
		"#0000FF": { r: -0.0449, g: -0.0752, b: 0.997 },
		"#FFFF00": { r: 1.0049, g: 1.0082, b: 0.0272 },
		"#00FFFF": { r: -0.2944, g: 1.0096, b: 0.9992 },
		"#FF00FF": { r: 1.027, g: -0.1635, b: 0.9978 },
		"#808080": { r: 0.4523, g: 0.4523, b: 0.4523 },
		"#FFA500": { r: 1.0218, g: 0.6038, b: 0.0148 },
	},
};
