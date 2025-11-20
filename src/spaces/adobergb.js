import { alloc3, free3 } from "../pool.js";
import { adobeRgbToLinear, clamp, generateMatricesFromPrimaries, linearToAdobeRgb, matmul, round, WHITEPOINT_D65 } from "../utils.js";

const [ADOBE_TO_XYZ_MATRIX, XYZ_TO_ADOBE_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.64, 0.33],
		[0.21, 0.71],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export default {
	name: "Adobe RGB (1998)",
	long: "Adobe RGB (1998) - D65, γ≈2.2",
	css: "a98-rgb",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = adobeRgbToLinear(rgb.r),
			gLin = adobeRgbToLinear(rgb.g),
			bLin = adobeRgbToLinear(rgb.b);

		const v3 = matmul(alloc3(), ADOBE_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_ADOBE_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(linearToAdobeRgb(v3[0]), 0, 1, unclamped);
		out.g = clamp(linearToAdobeRgb(v3[1]), 0, 1, unclamped);
		out.b = clamp(linearToAdobeRgb(v3[2]), 0, 1, unclamped);

		free3(v3);

		return out;
	},

	format: rgb => {
		const r = round(rgb.r, 3),
			g = round(rgb.g, 3),
			b = round(rgb.b, 3);

		return `color(a98-rgb ${r} ${g} ${b})`;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.8586, g: 0.0, b: 0.0 },
		"#00FF00": { r: 0.565, g: 1.0, b: 0.2344 },
		"#0000FF": { r: 0.0, g: 0.0, b: 0.9811 },
		"#FFFF00": { r: 1.0, g: 1.0, b: 0.2344 },
		"#00FFFF": { r: 0.565, g: 1.0, b: 1.0 },
		"#FF00FF": { r: 0.8586, g: 0.0, b: 0.9811 },
		"#808080": { r: 0.498, g: 0.498, b: 0.498 },
		"#FFA500": { r: 0.9149, g: 0.6412, b: 0.1503 },
	},
};
