import { alloc3, free3 } from "../pool.js";
import { clamp, LUMA_BT601, srgbToXyz, xyzToSrgb } from "../utils.js";

const { KR, KG, KB } = LUMA_BT601;

export default {
	name: "YPbPr",
	long: "YPbPr - Analog Component Video (Luma/Pb/Pr)",
	css: "ypbpr",
	tags: ["transfer_encoding"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 1, step: 0.001, round: 3, name: "Luma Y", primary: true },
		Pb: { from: 0, to: 1, step: 0.001, round: 3, name: "Pb" },
		Pr: { from: 0, to: 1, step: 0.001, round: 3, name: "Pr" },
	},

	from: (ypbpr, out = {}) => {
		const Y = ypbpr.y,
			Pb = ypbpr.Pb - 0.5,
			Pr = ypbpr.Pr - 0.5;

		const r = Y + 1.402 * Pr,
			g = Y - 0.344136 * Pb - 0.714136 * Pr,
			b = Y + 1.772 * Pb;

		const v3 = srgbToXyz(alloc3(), r, g, b);

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

		free3(v3);

		const Y = KR * v3[0] + KG * v3[1] + KB * v3[2],
			Pb = -0.168736 * v3[0] - 0.331264 * v3[1] + 0.5 * v3[2] + 0.5,
			Pr = 0.5 * v3[0] - 0.418688 * v3[1] - 0.081312 * v3[2] + 0.5;

		out.y = clamp(Y, 0, 1, unclamped);
		out.Pb = clamp(Pb, 0, 1, unclamped);
		out.Pr = clamp(Pr, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { y: 0.0, Pb: 0.5, Pr: 0.5 },
		"#FFFFFF": { y: 1.0, Pb: 0.502, Pr: 0.502 },
		"#FF0000": { y: 0.299, Pb: 0.3332, Pr: 1.0 },
		"#00FF00": { y: 0.587, Pb: 0.1707, Pr: 0.0835 },
		"#0000FF": { y: 0.114, Pb: 1.0, Pr: 0.4206 },
		"#FFFF00": { y: 0.886, Pb: 0.002, Pr: 0.5833 },
		"#00FFFF": { y: 0.701, Pb: 0.6707, Pr: 0.002 },
		"#FF00FF": { y: 0.413, Pb: 0.8332, Pr: 0.9207 },
		"#808080": { y: 0.502, Pb: 0.5, Pr: 0.5 },
		"#FFA500": { y: 0.6788, Pb: 0.1189, Pr: 0.731 },
	},
};
