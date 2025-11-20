import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, linearToRec709, matmul, rec709ToLinear, WHITEPOINT_D65 } from "../utils.js";

const [REC601_TO_XYZ_MATRIX, XYZ_TO_REC601_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.64, 0.33],
		[0.29, 0.6],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export default {
	name: "Rec. 601",
	long: "ITU-R BT.601 SDTV RGB (D65, Rec.709-like TRC)",
	css: "rec601",
	tags: ["device_rgb", "transfer_encoding"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = rec709ToLinear(rgb.r),
			gLin = rec709ToLinear(rgb.g),
			bLin = rec709ToLinear(rgb.b);

		const v3 = matmul(alloc3(), REC601_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_REC601_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToRec709(v3[0]),
			g = linearToRec709(v3[1]),
			b = linearToRec709(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#0000FF": { r: 0.0002, g: 0.0, b: 1.0058 },
		"#00FF00": { r: 0.1654, g: 1.0, b: -0.0537 },
		"#00FFFF": { r: 0.1656, g: 1.0, b: 0.9999 },
		"#808080": { r: 0.4523, g: 0.4522, b: 0.4522 },
		"#FF0000": { r: 0.9789, g: -0.0003, b: -0.0001 },
		"#FF00FF": { r: 0.9789, g: -0.0004, b: 1.0058 },
		"#FFA500": { r: 0.9869, g: 0.6088, b: -0.0203 },
		"#FFFF00": { r: 1.0, g: 0.9999, b: -0.0538 },
		"#FFFFFF": { r: 1.0, g: 0.9999, b: 0.9999 },
	},
};
