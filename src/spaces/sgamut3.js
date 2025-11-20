import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [SGAMUT3_TO_XYZ_MATRIX, XYZ_TO_SGAMUT3_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.73, 0.28],
		[0.14, 0.855],
		[0.1, -0.05],
	],
	WHITEPOINT_D65
);

export default {
	name: "S-Gamut3",
	long: "Sony S-Gamut3 Linear RGB (D65)",
	css: "s-gamut3",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), SGAMUT3_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_SGAMUT3_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1.0001, g: 1, b: 0.9999 },
		"#FF0000": { r: 0.5661, g: 0.0769, b: 0.0223 },
		"#00FF00": { r: 0.3428, g: 0.7991, b: 0.1086 },
		"#0000FF": { r: 0.0912, g: 0.124, b: 0.869 },
		"#FFFF00": { r: 0.9089, g: 0.876, b: 0.1309 },
		"#00FFFF": { r: 0.434, g: 0.9231, b: 0.9776 },
		"#FF00FF": { r: 0.6573, g: 0.2009, b: 0.8913 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2158 },
		"#FFA500": { r: 0.6951, g: 0.3776, b: 0.0632 },
	},
};
