import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [GOPRO_TO_XYZ_MATRIX, XYZ_TO_GOPRO_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.7177, 0.3171],
		[0.228, 0.8615],
		[0.1005, -0.082],
	],
	WHITEPOINT_D65
);

function linearToProtune(v) {
	return Math.sign(v) * (Math.log10(Math.abs(v) * 112 + 1) / Math.log10(113));
}

function protuneToLinear(v) {
	return Math.sign(v) * ((Math.pow(113, Math.abs(v)) - 1) / 112);
}

export default {
	name: "GoPro Protune Native",
	long: "GoPro Protune Native / Protune Flat Log Space",
	css: "gopro-protune-native",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = protuneToLinear(rgb.r),
			g_lin = protuneToLinear(rgb.g),
			b_lin = protuneToLinear(rgb.b);

		const v3 = matmul(alloc3(), GOPRO_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_GOPRO_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToProtune(v3[0]),
			g = linearToProtune(v3[1]),
			b = linearToProtune(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 1, g: 1, b: 1 },
		"#FF0000": { r: 0.9113, g: 0.3951, b: 0.3396 },
		"#00FF00": { r: 0.7272, g: 0.9512, b: 0.625 },
		"#0000FF": { r: 0.4779, g: 0.6206, b: 0.9538 },
		"#FFFF00": { r: 0.9833, g: 0.9638, b: 0.6649 },
		"#00FFFF": { r: 0.7787, g: 0.9895, b: 0.9924 },
		"#FF00FF": { r: 0.9344, g: 0.6746, b: 0.9629 },
		"#808080": { r: 0.6824, g: 0.6824, b: 0.6824 },
		"#FFA500": { r: 0.9414, g: 0.7796, b: 0.5226 },
	},
};
