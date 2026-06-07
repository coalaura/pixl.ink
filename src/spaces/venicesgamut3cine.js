import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToVSLog3, matmul, vsLog3ToLinear, WHITEPOINT_D65 } from "../utils.js";

const [SGAMUT3_CINE_TO_XYZ_MATRIX, XYZ_TO_SGAMUT3_CINE_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.766, 0.275],
		[0.225, 0.8],
		[0.089, -0.087],
	],
	WHITEPOINT_D65
);

export default {
	name: "Venice S-Gamut3.Cine",
	long: "Sony Venice S-Gamut3.Cine / S-Log3 Color Space",
	css: "venice-s-gamut3-cine",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = vsLog3ToLinear(rgb.r),
			g_lin = vsLog3ToLinear(rgb.g),
			b_lin = vsLog3ToLinear(rgb.b);

		const v3 = matmul(alloc3(), SGAMUT3_CINE_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_SGAMUT3_CINE_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToVSLog3(v3[0]),
			g = linearToVSLog3(v3[1]),
			b = linearToVSLog3(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0929, g: 0.0929, b: 0.0929 },
		"#FFFFFF": { r: 0.611, g: 0.611, b: 0.611 },
		"#FF0000": { r: 0.5619, g: 0.3455, b: 0.2626 },
		"#00FF00": { r: 0.4609, g: 0.5802, b: 0.3861 },
		"#0000FF": { r: 0.3541, g: 0.4036, b: 0.5906 },
		"#FFFF00": { r: 0.5998, g: 0.5924, b: 0.4128 },
		"#00FFFF": { r: 0.4953, g: 0.6007, b: 0.6068 },
		"#FF00FF": { r: 0.5773, g: 0.4525, b: 0.5955 },
		"#808080": { r: 0.4409, g: 0.4409, b: 0.4409 },
		"#FFA500": { r: 0.5777, g: 0.501, b: 0.3433 },
	},
};
