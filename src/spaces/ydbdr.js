import { alloc3, free3 } from "../pool.js";
import { clamp, makeMatrixPair, matmul, srgbToXyz, xyzToSrgb } from "../utils.js";

const [RGB_TO_YDBDR_MATRIX, YDBDR_TO_RGB_MATRIX] = makeMatrixPair([
	[0.299, 0.587, 0.114],
	[-0.45, -0.883, 1.333],
	[-1.333, 1.116, 0.217],
]);

export default {
	name: "YDbDr",
	long: "YDbDr - PAL/SECAM Analog Color-Difference Encoding",
	css: "ydbdr",
	tags: ["transfer_encoding"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 1, step: 0.01, round: 2, name: "Luma Y", primary: true },
		Db: { from: 0, to: 1, step: 0.01, round: 2, name: "Db" },
		Dr: { from: 0, to: 1, step: 0.01, round: 2, name: "Dr" },
	},

	from: (ydbdr, out = {}) => {
		const Y = ydbdr.y,
			Db = ydbdr.Db - 0.5,
			Dr = ydbdr.Dr - 0.5;

		const v3 = matmul(alloc3(), YDBDR_TO_RGB_MATRIX, Y, Db, Dr);

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

		matmul(v3, RGB_TO_YDBDR_MATRIX, v3[0], v3[1], v3[2]);

		const Y = v3[0],
			Db = v3[1],
			Dr = v3[2];

		free3(v3);

		out.y = clamp(Y, 0, 1, unclamped);
		out.Db = clamp(Db + 0.5, 0, 1, unclamped);
		out.Dr = clamp(Dr + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { y: 0.0, Db: 0.5, Dr: 0.5 },
		"#FFFFFF": { y: 1.0, Db: 0.5, Dr: 0.5 },
		"#FF0000": { y: 0.299, Db: 0.05, Dr: -0.833 },
		"#00FF00": { y: 0.587, Db: -0.383, Dr: 1.616 },
		"#0000FF": { y: 0.114, Db: 1.833, Dr: 0.717 },
		"#FFFF00": { y: 0.886, Db: -0.833, Dr: 0.283 },
		"#00FFFF": { y: 0.701, Db: 0.95, Dr: 1.833 },
		"#FF00FF": { y: 0.413, Db: 1.383, Dr: -0.616 },
		"#808080": { y: 0.502, Db: 0.5, Dr: 0.5 },
		"#FFA500": { y: 0.679, Db: -0.521, Dr: -0.111 },
	},
};
