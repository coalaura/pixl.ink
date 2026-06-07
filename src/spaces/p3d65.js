import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToSrgb, matmul, srgbToLinear, WHITEPOINT_D65 } from "../utils.js";

const [P3_TO_XYZ_MATRIX, XYZ_TO_P3_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.68, 0.32],
		[0.265, 0.69],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export default {
	name: "P3-D65",
	long: "DCI-P3 with D65 White Point (Display P3)",
	css: "display-p3",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 255, step: 1, round: 0, name: "Red" },
		g: { from: 0, to: 255, step: 1, round: 0, name: "Green" },
		b: { from: 0, to: 255, step: 1, round: 0, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = srgbToLinear(rgb.r),
			g_lin = srgbToLinear(rgb.g),
			b_lin = srgbToLinear(rgb.b);

		const v3 = matmul(alloc3(), P3_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_P3_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToSrgb(v3[0]),
			g = linearToSrgb(v3[1]),
			b = linearToSrgb(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	format: rgb => {
		const r = rgb.r.toFixed(4),
			g = rgb.g.toFixed(4),
			b = rgb.b.toFixed(4);

		return `color(display-p3 ${r} ${g} ${b})`;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.9174, g: 0.2002, b: 0.1386 },
		"#00FF00": { r: 0.4585, g: 0.9853, b: 0.2984 },
		"#0000FF": { r: 0, g: 0, b: 0.9596 },
		"#FFFF00": { r: 1, g: 1, b: 0.331 },
		"#00FFFF": { r: 0.4585, g: 0.9853, b: 0.9925 },
		"#FF00FF": { r: 0.9174, g: 0.2002, b: 0.9674 },
		"#808080": { r: 0.502, g: 0.502, b: 0.502 },
		"#FFA500": { r: 0.9496, g: 0.6629, b: 0.2331 },
	},
};
