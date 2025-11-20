import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, pow_sign, WHITEPOINT_D65 } from "../utils.js";

const GAMMA = 1.8,
	GAMMA_INV = 1 / GAMMA;

const [APPLE_RGB_TO_XYZ_MATRIX, XYZ_TO_APPLE_RGB_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.625, 0.34],
		[0.28, 0.595],
		[0.155, 0.07],
	],
	WHITEPOINT_D65
);

function appleToLinear(v) {
	return pow_sign(v, GAMMA);
}

function linearToApple(v) {
	return pow_sign(v, GAMMA_INV);
}

export default {
	name: "Apple RGB",
	long: "Apple RGB (D65, γ=1.8)",
	css: "apple-rgb",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = appleToLinear(rgb.r),
			gLin = appleToLinear(rgb.g),
			bLin = appleToLinear(rgb.b);

		const v3 = matmul(alloc3(), APPLE_RGB_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_APPLE_RGB_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToApple(v3[0]),
			g = linearToApple(v3[1]),
			b = linearToApple(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0001, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.9628, g: -0.1245, b: -0.0212 },
		"#00FF00": { r: 0.2403, g: 1.0222, b: -0.148 },
		"#0000FF": { r: -0.0805, g: -0.1032, b: 1.0182 },
		"#FFFF00": { r: 1.006, g: 1.0092, b: -0.1504 },
		"#00FFFF": { r: 0.221, g: 1.013, b: 1.0005 },
		"#FF00FF": { r: 0.9567, g: -0.1679, b: 1.0177 },
		"#808080": { r: 0.4267, g: 0.4267, b: 0.4267 },
		"#FFA500": { r: 0.9793, g: 0.5738, b: -0.0898 },
	},
};
