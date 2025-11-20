import { alloc3, free3 } from "../pool.js";
import { clamp, LUMA_BT601, srgbToXyz, xyzToSrgb } from "../utils.js";

const { KR, KG, KB } = LUMA_BT601;

export default {
	name: "YCbCr",
	long: "YCbCr - Digital Component Luma/Chroma (JPEG/MPEG/BT.601/709)",
	css: "ycbcr",
	tags: ["transfer_encoding"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 255, step: 1, round: 0, name: "Luma Y", primary: true },
		Cb: { from: 0, to: 255, step: 1, round: 0, name: "Cb" },
		Cr: { from: 0, to: 255, step: 1, round: 0, name: "Cr" },
	},

	from: (ycbcr, out = {}) => {
		const y = ycbcr.y,
			cb = ycbcr.Cb - 0.5,
			cr = ycbcr.Cr - 0.5;

		const r = y + 1.402 * cr,
			g = y - 0.344136 * cb - 0.714136 * cr,
			b = y + 1.772 * cb;

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

		out.y = clamp(KR * v3[0] + KG * v3[1] + KB * v3[2], 0, 1, unclamped);
		out.Cb = clamp(0.5 + (-0.168736 * v3[0] - 0.331264 * v3[1] + 0.5 * v3[2]), 0, 1, unclamped);
		out.Cr = clamp(0.5 + (0.5 * v3[0] - 0.418688 * v3[1] - 0.081312 * v3[2]), 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { y: 0.0, Cb: 0.502, Cr: 0.502 },
		"#FFFFFF": { y: 1.0, Cb: 0.502, Cr: 0.502 },
		"#FF0000": { y: 0.299, Cb: 0.3332, Cr: 1.0 },
		"#00FF00": { y: 0.587, Cb: 0.1707, Cr: 0.0835 },
		"#0000FF": { y: 0.114, Cb: 1.0, Cr: 0.4206 },
		"#FFFF00": { y: 0.886, Cb: 0.002, Cr: 0.5833 },
		"#00FFFF": { y: 0.701, Cb: 0.6707, Cr: 0.002 },
		"#FF00FF": { y: 0.413, Cb: 0.8332, Cr: 0.9207 },
		"#808080": { y: 0.502, Cb: 0.502, Cr: 0.502 },
		"#FFA500": { y: 0.6788, Cb: 0.1189, Cr: 0.731 },
	},
};
