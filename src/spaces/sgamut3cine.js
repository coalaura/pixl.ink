import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [SGAMUT3CINE_TO_XYZ_MATRIX, XYZ_TO_SGAMUT3CINE_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.766, 0.275],
		[0.225, 0.8],
		[0.089, -0.087],
	],
	WHITEPOINT_D65
);

export default {
	name: "S-Gamut3.Cine",
	long: "Sony S-Gamut3.Cine Linear RGB (D65)",
	css: "s-gamut3-cine",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), SGAMUT3CINE_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_SGAMUT3CINE_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1.0001, g: 1, b: 1 },
		"#FF0000": { r: 0.6457, g: 0.0875, b: 0.0369 },
		"#00FF00": { r: 0.2591, g: 0.7597, b: 0.1293 },
		"#0000FF": { r: 0.0952, g: 0.1528, b: 0.8337 },
		"#FFFF00": { r: 0.9048, g: 0.8472, b: 0.1662 },
		"#00FFFF": { r: 0.3544, g: 0.9125, b: 0.963 },
		"#FF00FF": { r: 0.741, g: 0.2402, b: 0.8707 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2159 },
		"#FFA500": { r: 0.7432, g: 0.3733, b: 0.0856 },
	},
};
