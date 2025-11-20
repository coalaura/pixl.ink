import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const SMPTE_240M_LINEAR_THRESHOLD = 0.0228,
	SMPTE_240M_ENCODED_THRESHOLD = SMPTE_240M_LINEAR_THRESHOLD * 4;

const [SMPTE240M_TO_XYZ_MATRIX, XYZ_TO_SMPTE240M_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.63, 0.34],
		[0.31, 0.595],
		[0.155, 0.07],
	],
	WHITEPOINT_D65
);

function smpte240mToLinear(v) {
	if (v <= SMPTE_240M_ENCODED_THRESHOLD) {
		return v / 4;
	}

	return ((v + 0.1115) / 1.1115) ** (1 / 0.45);
}

function linearToSmpte240m(v) {
	if (v <= SMPTE_240M_LINEAR_THRESHOLD) {
		return 4 * v;
	}

	return 1.1115 * Math.pow(v, 0.45) - 0.1115;
}

export default {
	name: "SMPTE 240M",
	long: "SMPTE 240M / SMPTE-C HDTV RGB (D65, γ≈2.2)",
	css: "smpte-240m",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = smpte240mToLinear(rgb.r),
			gLin = smpte240mToLinear(rgb.g),
			bLin = smpte240mToLinear(rgb.b);

		const v3 = matmul(alloc3(), SMPTE240M_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_SMPTE240M_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToSmpte240m(v3[0]),
			g = linearToSmpte240m(v3[1]),
			b = linearToSmpte240m(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#0000FF": { r: -0.0396, g: -0.0669, b: 0.997 },
		"#00FF00": { r: -0.2216, g: 1.018, b: 0.0177 },
		"#00FFFF": { r: -0.2612, g: 1.0098, b: 0.9992 },
		"#808080": { r: 0.4461, g: 0.446, b: 0.446 },
		"#FF0000": { r: 1.0322, g: -0.0789, b: 0.0064 },
		"#FF00FF": { r: 1.0274, g: -0.1458, b: 0.9978 },
		"#FFA500": { r: 1.0221, g: 0.5993, b: 0.0131 },
		"#FFFF00": { r: 1.005, g: 1.0083, b: 0.0241 },
		"#FFFFFF": { r: 1.0001, g: 1.0, b: 1.0 },
	},
};
