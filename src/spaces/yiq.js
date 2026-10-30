import { alloc3, free3 } from "../pool.js";
import { clamp, makeMatrixPair, matmul, srgbToXyz, xyzToSrgb } from "../utils.js";

const [RGB_TO_YIQ_MATRIX, YIQ_TO_RGB_MATRIX] = makeMatrixPair([
	[0.299, 0.587, 0.114],
	[0.595716, -0.274453, -0.321263],
	[0.211456, -0.522591, 0.311135],
]);

export const shaderConstants = {
	RGB_TO_YIQ_MATRIX: RGB_TO_YIQ_MATRIX,
	YIQ_TO_RGB_MATRIX: YIQ_TO_RGB_MATRIX,
};

export default {
	name: "YIQ",
	long: "YIQ - NTSC Analog Color-Difference Encoding",
	css: "yiq",
	tags: ["transfer_encoding"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 1, step: 0.01, round: 2, name: "Luma Y", primary: true },
		i: { from: -0.595716, to: 0.595716, step: 0.001, round: 3, name: "I" },
		q: { from: -0.522591, to: 0.522591, step: 0.001, round: 3, name: "Q" },
	},

	from: (yiq, out = {}) => {
		const Y = yiq.y,
			I = (yiq.i - 0.5) * 1.191432,
			Q = (yiq.q - 0.5) * 1.045182;

		const v3 = matmul(alloc3(), YIQ_TO_RGB_MATRIX, Y, I, Q);

		srgbToXyz(v3, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		v3[0] = clamp(v3[0], 0, 1, unclamped);
		v3[1] = clamp(v3[1], 0, 1, unclamped);
		v3[2] = clamp(v3[2], 0, 1, unclamped);

		matmul(v3, RGB_TO_YIQ_MATRIX, v3[0], v3[1], v3[2]);

		const Y = v3[0],
			I = v3[1],
			Q = v3[2];

		free3(v3);

		out.y = clamp(Y, 0, 1, unclamped);
		out.i = clamp(I / 1.191432 + 0.5, 0, 1, unclamped);
		out.q = clamp(Q / 1.045182 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { y: 0.0, i: 0.5, q: 0.5 },
		"#FFFFFF": { y: 1.0, i: 0.5, q: 0.5 },
		"#FF0000": { y: 0.299, i: 1, q: 0.702315 },
		"#00FF00": { y: 0.587, i: 0.269644, q: 0 },
		"#0000FF": { y: 0.114, i: 0.230356, q: 0.797685 },
		"#FFFF00": { y: 0.886, i: 0.769644, q: 0.202315 },
		"#00FFFF": { y: 0.701, i: 0, q: 0.297685 },
		"#FF00FF": { y: 0.413, i: 0.730356, q: 1 },
		"#808080": { y: 0.502, i: 0.5, q: 0.5 },
		"#FFA500": { y: 0.678824, i: 0.850946, q: 0.378786 },
	},
};
