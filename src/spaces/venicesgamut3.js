import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToVSLog3, matmul, vsLog3ToLinear, WHITEPOINT_D65 } from "../utils.js";

const [VSGAMUT3_TO_XYZ_MATRIX, XYZ_TO_VSGAMUT3_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.73, 0.28],
		[0.14, 0.855],
		[0.1, -0.05],
	],
	WHITEPOINT_D65
);

export default {
	name: "Venice S-Gamut3",
	long: "Sony Venice S-Gamut3 / S-Log3 Color Space",
	css: "venice-s-gamut3",
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

		const v3 = matmul(alloc3(), VSGAMUT3_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_VSGAMUT3_MATRIX, xyz.x, xyz.y, xyz.z);

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
		"#FF0000": { r: 0.5472, g: 0.3325, b: 0.2202 },
		"#00FF00": { r: 0.4916, g: 0.5859, b: 0.3679 },
		"#0000FF": { r: 0.3497, g: 0.3815, b: 0.5952 },
		"#FFFF00": { r: 0.6003, g: 0.5962, b: 0.3875 },
		"#00FFFF": { r: 0.5177, g: 0.602, b: 0.6085 },
		"#FF00FF": { r: 0.5639, g: 0.4331, b: 0.5981 },
		"#808080": { r: 0.4409, g: 0.4409, b: 0.4409 },
		"#FFA500": { r: 0.5702, g: 0.5023, b: 0.3131 },
	},
};
