import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, linearRgbToXyz, makeMatrixPair, matmul, xyzToLinearRgb } from "../utils.js";

const BIAS = 0.00379307325527544933,
	BIAS_CBRT = Math.cbrt(BIAS);

const [LRGB_TO_LMS_MATRIX, LMS_TO_LRGB_MATRIX] = makeMatrixPair([
	[0.3, 0.622, 0.078],
	[0.23, 0.692, 0.078],
	[0.24342268924547819, 0.20476744424496821, 0.5518098665095536],
]);

const [XYB_LMS_TO_XYB_MATRIX, XYB_TO_XYB_LMS_MATRIX] = makeMatrixPair([
	[0.5, -0.5, 0.0],
	[0.5, 0.5, 0.0],
	[0.0, 0.0, 1.0],
]);

function rgbLinearToXYB(out, r, g, b) {
	matmul(out, LRGB_TO_LMS_MATRIX, r, g, b);

	out = matmul(out, XYB_LMS_TO_XYB_MATRIX, Math.cbrt(out[0] + BIAS) - BIAS_CBRT, Math.cbrt(out[1] + BIAS) - BIAS_CBRT, Math.cbrt(out[2] + BIAS) - BIAS_CBRT);

	out[2] -= out[1];

	return out;
}

function xybToRgbLinear(out, xIn, yIn, bIn) {
	if (Math.abs(xIn) < EPS_PRECISION && Math.abs(yIn) < EPS_PRECISION && Math.abs(bIn) < EPS_PRECISION) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;

		return out;
	}

	matmul(out, XYB_TO_XYB_LMS_MATRIX, xIn, yIn, bIn + yIn);

	out = matmul(out, LMS_TO_LRGB_MATRIX, (out[0] + BIAS_CBRT) ** 3 - BIAS, (out[1] + BIAS_CBRT) ** 3 - BIAS, (out[2] + BIAS_CBRT) ** 3 - BIAS);

	return out;
}

const X_RANGE = 0.05,
	Y_MAX = 0.845,
	B_RANGE = 0.45;

export default {
	name: "XYB",
	long: "JPEG XL XYB (opponent space on biased, cube-rooted LMS from linear sRGB)",
	css: "xyb",
	tags: ["transfer_encoding", "opponent_space"],
	base: "Linear sRGB",
	ui: {
		x: { from: -X_RANGE, to: X_RANGE, step: 0.001, round: 3, name: "X" },
		y: { from: 0.0, to: Y_MAX, step: 0.001, round: 3, name: "Y", primary: true },
		b: { from: -B_RANGE, to: B_RANGE, step: 0.001, round: 3, name: "B" },
	},

	from: (xyb, out = {}) => {
		const X = (xyb.x - 0.5) * (2 * X_RANGE),
			Y = xyb.y * Y_MAX,
			B = (xyb.b - 0.5) * (2 * B_RANGE);

		const v3 = xybToRgbLinear(alloc3(), X, Y, B);

		linearRgbToXyz(v3, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToLinearRgb(alloc3(), xyz.x, xyz.y, xyz.z);

		rgbLinearToXYB(v3, v3[0], v3[1], v3[2]);

		const x_n = v3[0] / (2 * X_RANGE) + 0.5,
			y_n = v3[1] / Y_MAX,
			b_n = v3[2] / (2 * B_RANGE) + 0.5;

		free3(v3);

		out.x = clamp(x_n, 0, 1, unclamped);
		out.y = clamp(y_n, 0, 1, unclamped);
		out.b = clamp(b_n, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { x: 0.5, y: 0.0, b: 0.5 },
		"#FFFFFF": { x: 0.5, y: 1.0004, b: 0.5 },
		"#FF0000": { x: 0.781, y: 0.5777, b: 0.4816 },
		"#00FF00": { x: 0.3461, y: 0.8459, b: 0.1914 },
		"#0000FF": { x: 0.5, y: 0.3291, b: 0.9311 },
		"#FFFF00": { x: 0.5, y: 0.9688, b: 0.2698 },
		"#00FFFF": { x: 0.3572, y: 0.885, b: 0.5099 },
		"#FF00FF": { x: 0.7368, y: 0.6459, b: 0.7513 },
		"#808080": { x: 0.5, y: 0.5295, b: 0.5 },
		"#FFA500": { x: 0.6132, y: 0.7645, b: 0.3723 },
	},
};
