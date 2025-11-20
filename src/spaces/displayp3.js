import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToSrgb, matmul, round, srgbToLinear, WHITEPOINT_D65 } from "../utils.js";

const [DISPLAYP3_TO_XYZ_MATRIX, XYZ_TO_DISPLAYP3_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.68, 0.32],
		[0.265, 0.69],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export default {
	name: "Display P3",
	long: "Display P3 - P3-D65 Primaries with sRGB Transfer Function",
	css: "display-p3",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r = srgbToLinear(rgb.r),
			g = srgbToLinear(rgb.g),
			b = srgbToLinear(rgb.b);

		const v3 = matmul(alloc3(), DISPLAYP3_TO_XYZ_MATRIX, r, g, b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const x = xyz.x,
			y = xyz.y,
			z = xyz.z;

		const v3 = matmul(alloc3(), XYZ_TO_DISPLAYP3_MATRIX, x, y, z);

		const r = linearToSrgb(v3[0]),
			g = linearToSrgb(v3[1]),
			b = linearToSrgb(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	format: p3 => {
		const r = round(p3.r, 3),
			g = round(p3.g, 3),
			b = round(p3.b, 3);

		return `color(display-p3 ${r} ${g} ${b})`;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.9175, g: 0.2003, b: 0.1386 },
		"#00FF00": { r: 0.4584, g: 0.9853, b: 0.2983 },
		"#0000FF": { r: 0.0, g: 0.0, b: 0.9596 },
		"#FFFF00": { r: 1.0, g: 1.0, b: 0.3309 },
		"#00FFFF": { r: 0.4584, g: 0.9853, b: 0.9925 },
		"#FF00FF": { r: 0.9175, g: 0.2003, b: 0.9675 },
		"#808080": { r: 0.502, g: 0.502, b: 0.502 },
		"#FFA500": { r: 0.9497, g: 0.6629, b: 0.233 },
	},
};
