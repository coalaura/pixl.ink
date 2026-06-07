import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [CANON_CG_TO_XYZ_MATRIX, XYZ_TO_CANON_CG_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.74, 0.27],
		[0.17, 1.14],
		[0.08, -0.1],
	],
	WHITEPOINT_D65
);

export default {
	name: "Canon Cinema Gamut",
	long: "Canon Cinema Gamut (Linear)",
	css: "canon-cinema-gamut",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), CANON_CG_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_CANON_CG_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.556, g: 0.0824, b: 0.0331 },
		"#00FF00": { r: 0.3294, g: 0.7577, b: 0.226 },
		"#0000FF": { r: 0.1146, g: 0.16, b: 0.7409 },
		"#FFFF00": { r: 0.8854, g: 0.84, b: 0.2591 },
		"#00FFFF": { r: 0.444, g: 0.9176, b: 0.9669 },
		"#FF00FF": { r: 0.6706, g: 0.2423, b: 0.774 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2159 },
		"#FFA500": { r: 0.68, g: 0.3674, b: 0.1181 },
	},
};
