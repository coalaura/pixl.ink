import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [REDWIDEGAMUT_TO_XYZ_MATRIX, XYZ_TO_REDWIDEGAMUT_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.780308, 0.304253],
		[0.121595, 1.493994],
		[0.095612, -0.084589],
	],
	WHITEPOINT_D65
);

export default {
	name: "REDWideGamutRGB",
	long: "REDWideGamutRGB (RED, D65/2°, linear)",
	css: "red-wide-gamut-rgb",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), REDWIDEGAMUT_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_REDWIDEGAMUT_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.5421, g: 0.077, b: 0.0589 },
		"#00FF00": { r: 0.3602, g: 0.768, b: 0.2735 },
		"#0000FF": { r: 0.0978, g: 0.1551, b: 0.6675 },
		"#FFFF00": { r: 0.9021, g: 0.8449, b: 0.3323 },
		"#00FFFF": { r: 0.458, g: 0.9229, b: 0.941 },
		"#FF00FF": { r: 0.6399, g: 0.2319, b: 0.7263 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2158 },
		"#FFA500": { r: 0.6775, g: 0.366, b: 0.1618 },
	},
};
