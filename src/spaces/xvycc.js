import { alloc3, free3 } from "../pool.js";
import { clamp, LUMA_BT709, srgbToXyz, xyzToSrgb } from "../utils.js";

const { KR, KG, KB } = LUMA_BT709;

const CB_SCALE = 2 * (1 - KB),
	CR_SCALE = 2 * (1 - KR);

export default {
	name: "xvYCC",
	long: "IEC 61966-2-4 xvYCC (BT.709 luma, studio-range Y'CbCr; sRGB-coded R'G'B')",
	css: "xv-ycc",
	tags: ["transfer_encoding", "wide_gamut"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 255, step: 1, round: 0, name: "Luma Y'", primary: true },
		Cb: { from: 0, to: 255, step: 1, round: 0, name: "Cb" },
		Cr: { from: 0, to: 255, step: 1, round: 0, name: "Cr" },
	},

	from: (ycc, out = {}) => {
		const Yp = (255 * ycc.y - 16) / 219,
			Cb = (255 * ycc.Cb - 128) / 224,
			Cr = (255 * ycc.Cr - 128) / 224;

		const rPrime = Yp + CR_SCALE * Cr,
			bPrime = Yp + CB_SCALE * Cb,
			gPrime = (Yp - KR * rPrime - KB * bPrime) / KG;

		const xyz = srgbToXyz(alloc3(), rPrime, gPrime, bPrime);

		out.x = xyz[0];
		out.y = xyz[1];
		out.z = xyz[2];

		free3(xyz);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const rgb = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const Yp = KR * rgb[0] + KG * rgb[1] + KB * rgb[2],
			Cb = (rgb[2] - Yp) / CB_SCALE,
			Cr = (rgb[0] - Yp) / CR_SCALE;

		free3(rgb);

		const Y_out = (16 + 219 * Yp) / 255,
			Cb_out = (128 + 224 * Cb) / 255,
			Cr_out = (128 + 224 * Cr) / 255;

		out.y = clamp(Y_out, 0, 1, unclamped);
		out.Cb = clamp(Cb_out, 0, 1, unclamped);
		out.Cr = clamp(Cr_out, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { y: 0.0627, Cb: 0.502, Cr: 0.502 },
		"#FFFFFF": { y: 0.9216, Cb: 0.502, Cr: 0.502 },
		"#FF0000": { y: 0.2453, Cb: 0.4013, Cr: 0.9412 },
		"#00FF00": { y: 0.677, Cb: 0.1634, Cr: 0.103 },
		"#0000FF": { y: 0.1248, Cb: 0.9412, Cr: 0.4617 },
		"#FFFF00": { y: 0.8596, Cb: 0.0627, Cr: 0.5422 },
		"#00FFFF": { y: 0.739, Cb: 0.6026, Cr: 0.0627 },
		"#FF00FF": { y: 0.3073, Cb: 0.8405, Cr: 0.9009 },
		"#808080": { y: 0.4938, Cb: 0.502, Cr: 0.502 },
		"#FFA500": { y: 0.6428, Cb: 0.1822, Cr: 0.683 },
	},
};
