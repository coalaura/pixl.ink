import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, LUMA_BT709, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "IHLS",
	long: "Improved HLS (Hanbury & Serra)",
	css: "ihls",
	tags: ["cylindrical_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		l: { from: 0, to: 100, step: 1, round: 0, name: "Luminance", primary: true },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
	},

	from: (ihls, out = {}) => {
		const H = ihls.h * 6,
			S = ihls.s,
			L = ihls.l;

		const C = S,
			X = C * (1 - Math.abs((H % 2) - 1));

		let r1 = 0,
			g1 = 0,
			b1 = 0;

		if (H < 1) {
			r1 = C;
			g1 = X;
		} else if (H < 2) {
			r1 = X;
			g1 = C;
		} else if (H < 3) {
			g1 = C;
			b1 = X;
		} else if (H < 4) {
			g1 = X;
			b1 = C;
		} else if (H < 5) {
			r1 = X;
			b1 = C;
		} else {
			r1 = C;
			b1 = X;
		}

		const lChrom = LUMA_BT709.KR * r1 + LUMA_BT709.KG * g1 + LUMA_BT709.KB * b1,
			m = L - lChrom;

		const xyz = srgbToXyz(alloc3(), r1 + m, g1 + m, b1 + m);

		out.x = xyz[0];
		out.y = xyz[1];
		out.z = xyz[2];

		free3(xyz);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const rgb = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const r = rgb[0],
			g = rgb[1],
			b = rgb[2];

		free3(rgb);

		const max = Math.max(r, g, b),
			min = Math.min(r, g, b);

		const S = max - min,
			L = LUMA_BT709.KR * r + LUMA_BT709.KG * g + LUMA_BT709.KB * b;

		let H = 0;

		if (S > EPS_PRECISION) {
			if (max === r) {
				H = (g - b) / S + (g < b ? 6 : 0);
			} else if (max === g) {
				H = (b - r) / S + 2;
			} else {
				H = (r - g) / S + 4;
			}

			H /= 6;
		}

		out.h = clamp(H, 0, 1, unclamped);
		out.l = clamp(L, 0, 1, unclamped);
		out.s = clamp(S, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, l: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, l: 1.0 },
		"#FF0000": { h: 0.0, s: 1.0, l: 0.2126 },
		"#00FF00": { h: 0.3333, s: 1.0, l: 0.7152 },
		"#0000FF": { h: 0.6667, s: 1.0, l: 0.0722 },
		"#FFFF00": { h: 0.1667, s: 1.0, l: 0.9278 },
		"#00FFFF": { h: 0.5, s: 1.0, l: 0.7874 },
		"#FF00FF": { h: 0.8333, s: 1.0, l: 0.2848 },
		"#808080": { h: 0.0, s: 0.0, l: 0.502 },
		"#FFA500": { h: 0.1101, s: 1.0, l: 0.6754 },
	},
};
