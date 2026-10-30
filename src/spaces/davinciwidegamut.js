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
	if (v > 0.00262409) {
		return 0.07329248 * (Math.log2(v + 0.0075) + 7);
	}

	return 10.44426855 * v;
}

function diToLinear(v) {
	if (v > 0.02740668) {
		return 2 ** (v / 0.07329248 - 7) - 0.0075;
	}

	return v / 10.44426855;
}

export const shaderConstants = {
	DWG_TO_XYZ_MATRIX: DWG_TO_XYZ_MATRIX,
	XYZ_TO_DWG_MATRIX: XYZ_TO_DWG_MATRIX,
};

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
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 0.513837, g: 0.513837, b: 0.513837 },
		"#FF0000": { r: 0.453634, g: 0.252651, b: 0.235092 },
		"#00FF00": { r: 0.396206, g: 0.483648, b: 0.342692 },
		"#0000FF": { r: 0.289868, g: 0.331738, b: 0.482721 },
		"#FFFF00": { r: 0.501181, g: 0.493978, b: 0.372361 },
		"#00FFFF": { r: 0.427401, g: 0.50535, b: 0.506822 },
		"#FF00FF": { r: 0.472856, g: 0.369682, b: 0.49146 },
		"#808080": { r: 0.354548, g: 0.354548, b: 0.354548 },
		"#FFA500": { r: 0.474107, g: 0.407148, b: 0.308483 },
	},
};
