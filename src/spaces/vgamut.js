import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [VGAMUT_TO_XYZ_MATRIX, XYZ_TO_VGAMUT_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.73, 0.28],
		[0.165, 0.84],
		[0.1, -0.03],
	],
	WHITEPOINT_D65
);

export default {
	name: "Panasonic V-Gamut",
	long: "Panasonic V-Gamut Linear RGB (D65)",
	css: "v-gamut",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), VGAMUT_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_VGAMUT_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1.0001, g: 1, b: 0.9999 },
		"#FF0000": { r: 0.5852, g: 0.0785, b: 0.0228 },
		"#00FF00": { r: 0.3227, g: 0.8197, b: 0.1142 },
		"#0000FF": { r: 0.0922, g: 0.1018, b: 0.863 },
		"#FFFF00": { r: 0.9079, g: 0.8982, b: 0.137 },
		"#00FFFF": { r: 0.4149, g: 0.9214, b: 0.9772 },
		"#FF00FF": { r: 0.6774, g: 0.1803, b: 0.8857 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2158 },
		"#FFA500": { r: 0.7066, g: 0.3869, b: 0.0657 },
	},
};
