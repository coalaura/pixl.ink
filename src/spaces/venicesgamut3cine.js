import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToVSLog3, matmul, vsLog3ToLinear, WHITEPOINT_D65 } from "../utils.js";

const [SGAMUT3_CINE_TO_XYZ_MATRIX, XYZ_TO_SGAMUT3_CINE_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.775901871567345, 0.274502392854799],
		[0.188682902773355, 0.828684937020288],
		[0.101337382499301, -0.089187517306263],
	],
	WHITEPOINT_D65
);

export const shaderConstants = {
	SGAMUT3_CINE_TO_XYZ_MATRIX: SGAMUT3_CINE_TO_XYZ_MATRIX,
	XYZ_TO_SGAMUT3_CINE_MATRIX: XYZ_TO_SGAMUT3_CINE_MATRIX,
};

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
		"#000000": { r: 0.092864, g: 0.092864, b: 0.092864 },
		"#FFFFFF": { r: 0.596027, g: 0.596027, b: 0.596027 },
		"#FF0000": { r: 0.542951, g: 0.338942, b: 0.26305 },
		"#00FF00": { r: 0.466455, g: 0.564527, b: 0.374108 },
		"#0000FF": { r: 0.326964, g: 0.398105, b: 0.575944 },
		"#FFFF00": { r: 0.586928, g: 0.576902, b: 0.402777 },
		"#00FFFF": { r: 0.491479, g: 0.585705, b: 0.591505 },
		"#FF00FF": { r: 0.556217, g: 0.445171, b: 0.581131 },
		"#808080": { r: 0.429751, g: 0.429751, b: 0.429751 },
		"#FFA500": { r: 0.561597, g: 0.488105, b: 0.337098 },
	},
};
