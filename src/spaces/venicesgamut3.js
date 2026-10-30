import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToVSLog3, matmul, vsLog3ToLinear, WHITEPOINT_D65 } from "../utils.js";

const [VSGAMUT3_TO_XYZ_MATRIX, XYZ_TO_VSGAMUT3_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.740464264304292, 0.279364374750660],
		[0.089241145423286, 0.893809528608105],
		[0.110488236673827, -0.052579333080476],
	],
	WHITEPOINT_D65
);

export const shaderConstants = {
	VSGAMUT3_TO_XYZ_MATRIX: VSGAMUT3_TO_XYZ_MATRIX,
	XYZ_TO_VSGAMUT3_MATRIX: XYZ_TO_VSGAMUT3_MATRIX,
};

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
		"#000000": { r: 0.092864, g: 0.092864, b: 0.092864 },
		"#FFFFFF": { r: 0.596027, g: 0.596027, b: 0.596027 },
		"#FF0000": { r: 0.528765, g: 0.327338, b: 0.227259 },
		"#00FF00": { r: 0.490404, g: 0.569909, b: 0.355107 },
		"#0000FF": { r: 0.326248, g: 0.378192, b: 0.580511 },
		"#FFFF00": { r: 0.586997, g: 0.580485, b: 0.378033 },
		"#00FFFF": { r: 0.510857, g: 0.586892, b: 0.593081 },
		"#FF00FF": { r: 0.543622, g: 0.427704, b: 0.583804 },
		"#808080": { r: 0.429751, g: 0.429751, b: 0.429751 },
		"#FFA500": { r: 0.554378, g: 0.489354, b: 0.308936 },
	},
};
