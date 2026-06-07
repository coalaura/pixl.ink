import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [DWG_TO_XYZ_MATRIX, XYZ_TO_DWG_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.8, 0.313],
		[0.1682, 0.9877],
		[0.079, -0.1155],
	],
	WHITEPOINT_D65
);

function linearToDI(v) {
	if (v > 0.01047561) {
		return 0.07632731 * Math.log(v + 0.0075) + 0.53031317;
	}
	return 4.31671239 * v + 0.12453424;
}

function diToLinear(v) {
	if (v > 0.16972242) {
		return Math.exp((v - 0.53031317) / 0.07632731) - 0.0075;
	}
	return (v - 0.12453424) / 4.31671239;
}

export default {
	name: "DaVinci Wide Gamut",
	long: "DaVinci Wide Gamut (DWG) / DaVinci Intermediate (DI)",
	css: "davinci-wide-gamut",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = diToLinear(rgb.r),
			g_lin = diToLinear(rgb.g),
			b_lin = diToLinear(rgb.b);

		const v3 = matmul(alloc3(), DWG_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_DWG_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToDI(v3[0]),
			g = linearToDI(v3[1]),
			b = linearToDI(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.1245, g: 0.1245, b: 0.1245 },
		"#FFFFFF": { r: 0.5309, g: 0.5309, b: 0.5309 },
		"#FF0000": { r: 0.4874, g: 0.3423, b: 0.3297 },
		"#00FF00": { r: 0.446, g: 0.5091, b: 0.4073 },
		"#0000FF": { r: 0.3692, g: 0.3994, b: 0.5084 },
		"#FFFF00": { r: 0.5217, g: 0.5165, b: 0.4288 },
		"#00FFFF": { r: 0.4685, g: 0.5248, b: 0.5258 },
		"#FF00FF": { r: 0.5013, g: 0.4268, b: 0.5147 },
		"#808080": { r: 0.4159, g: 0.4159, b: 0.4159 },
		"#FFA500": { r: 0.5022, g: 0.4539, b: 0.3826 },
	},
};
