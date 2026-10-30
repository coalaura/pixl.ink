import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToSrgb, matmul, spow, WHITEPOINT_D65 } from "../utils.js";

const [P3_TO_XYZ_MATRIX, XYZ_TO_P3_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.68, 0.32],
		[0.265, 0.69],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export const shaderConstants = {
	P3_TO_XYZ_MATRIX: P3_TO_XYZ_MATRIX,
	XYZ_TO_P3_MATRIX: XYZ_TO_P3_MATRIX,
};

export default {
	name: "P3-D65",
	long: "P3-D65 (D65 White Point, Gamma 2.6)",
	css: "p3-d65",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 255, step: 1, round: 0, name: "Red" },
		g: { from: 0, to: 255, step: 1, round: 0, name: "Green" },
		b: { from: 0, to: 255, step: 1, round: 0, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = spow(rgb.r, 2.6),
			g_lin = spow(rgb.g, 2.6),
			b_lin = spow(rgb.b, 2.6);

		const v3 = matmul(alloc3(), P3_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_P3_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 2.6),
			g = spow(v3[1], 1 / 2.6),
			b = spow(v3[2], 1 / 2.6);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	format: rgb => {
		const r = linearToSrgb(spow(rgb.r, 2.6)).toFixed(4),
			g = linearToSrgb(spow(rgb.g, 2.6)).toFixed(4),
			b = linearToSrgb(spow(rgb.b, 2.6)).toFixed(4);

		return `color(display-p3 ${r} ${g} ${b})`;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.927529, g: 0.2698, b: 0.209048 },
		"#00FF00": { r: 0.514495, g: 0.987111, b: 0.364422 },
		"#0000FF": { r: 0, g: 0, b: 0.964557 },
		"#FFFF00": { r: 1, g: 1, b: 0.395334 },
		"#00FFFF": { r: 0.514495, g: 0.987111, b: 0.993394 },
		"#FF00FF": { r: 0.927529, g: 0.2698, b: 0.971479 },
		"#808080": { r: 0.554514, g: 0.554514, b: 0.554514 },
		"#FFA500": { r: 0.955833, g: 0.700919, b: 0.301711 },
	},
};
