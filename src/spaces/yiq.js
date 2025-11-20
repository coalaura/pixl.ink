import { alloc3, free3 } from "../pool.js";
import { clamp, makeMatrixPair, matmul, srgbToXyz, xyzToSrgb } from "../utils.js";

const [RGB_TO_YIQ_MATRIX, YIQ_TO_RGB_MATRIX] = makeMatrixPair([
	[0.299, 0.587, 0.114],
	[0.595716, -0.274453, -0.321263],
	[0.211456, -0.522591, 0.311135],
]);

export default {
	name: "YIQ",
	long: "YIQ - NTSC Analog Color-Difference Encoding",
	css: "yiq",
	tags: ["transfer_encoding"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 1, step: 0.01, round: 2, name: "Luma Y", primary: true },
		i: { from: 0, to: 1, step: 0.01, round: 2, name: "I" },
		q: { from: 0, to: 1, step: 0.01, round: 2, name: "Q" },
	},

	from: (yiq, out = {}) => {
		const Y = yiq.y,
			I = yiq.i - 0.5,
			Q = yiq.q - 0.5;

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
		out.i = clamp(I + 0.5, 0, 1, unclamped);
		out.q = clamp(Q + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { y: 0.0, i: 0.5, q: 0.5 },
		"#FFFFFF": { y: 1.0, i: 0.5, q: 0.5 },
		"#FF0000": { y: 0.299, i: 1.0956743594544895, q: 0.711 },
		"#00FF00": { y: 0.587, i: 0.226, q: -0.022596237093465255 },
		"#0000FF": { y: 0.114, i: 0.178, q: 0.812 },
		"#FFFF00": { y: 0.886, i: 0.822, q: 0.188 },
		"#00FFFF": { y: 0.701, i: -0.09575236164895673, q: 0.289 },
		"#FF00FF": { y: 0.413, i: 0.774, q: 1.0226091120095204 },
		"#808080": { y: 0.502, i: 0.5, q: 0.5 },
		"#FFA500": { y: 0.679, i: 0.9187, q: 0.3727 },
	},
};
