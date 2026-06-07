import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, WHITEPOINT_D65 } from "../utils.js";

const [NIKON_TO_XYZ_MATRIX, XYZ_TO_NIKON_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.708, 0.292],
		[0.17, 0.797],
		[0.131, 0.046],
	],
	WHITEPOINT_D65
);

function linearToNLog(v) {
	if (v >= 0.0031853) {
		return 0.270954 * Math.log10(10.968434 * v + 0.043545) + 0.55376;
	}

	return 5.75 * v + 0.0929;
}

function nLogToLinear(v) {
	if (v >= 0.111215) {
		return (Math.pow(10, (v - 0.55376) / 0.270954) - 0.043545) / 10.968434;
	}

	return (v - 0.0929) / 5.75;
}

export default {
	name: "Nikon N-Gamut",
	long: "Nikon N-Gamut / N-Log Color Space",
	css: "nikon-n-gamut",
	tags: ["device_rgb", "wide_gamut", "log_curve"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = nLogToLinear(rgb.r),
			g_lin = nLogToLinear(rgb.g),
			b_lin = nLogToLinear(rgb.b);

		const v3 = matmul(alloc3(), NIKON_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_NIKON_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToNLog(v3[0]),
			g = linearToNLog(v3[1]),
			b = linearToNLog(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0929, g: 0.0929, b: 0.0929 },
		"#FFFFFF": { r: 0.8361, g: 0.8361, b: 0.8361 },
		"#FF0000": { r: 0.7814, g: 0.5276, b: 0.3774 },
		"#00FF00": { r: 0.7064, g: 0.8262, b: 0.5549 },
		"#0000FF": { r: 0.4764, g: 0.3439, b: 0.8231 },
		"#FFFF00": { r: 0.8309, g: 0.8347, b: 0.5742 },
		"#00FFFF": { r: 0.7207, g: 0.8277, b: 0.8341 },
		"#FF00FF": { r: 0.7893, g: 0.5446, b: 0.8252 },
		"#808080": { r: 0.6573, g: 0.6573, b: 0.6573 },
		"#FFA500": { r: 0.8025, g: 0.7332, b: 0.4911 },
	},
};
