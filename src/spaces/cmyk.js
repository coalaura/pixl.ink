import { alloc3, free3 } from "../pool.js";
import { clamp, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "CMYK",
	long: "Cyan-Magenta-Yellow-Key (CMYK) Subtractive Process",
	css: "cmyk",
	tags: ["transfer_encoding"],
	base: "sRGB",
	ui: {
		c: { from: 0, to: 100, step: 1, round: 0, name: "Cyan" },
		m: { from: 0, to: 100, step: 1, round: 0, name: "Magenta" },
		y: { from: 0, to: 100, step: 1, round: 0, name: "Yellow" },
		k: { from: 0, to: 100, step: 1, round: 0, name: "Black" },
	},

	from: (cmyk, out = {}) => {
		const rGamma = (1 - cmyk.c) * (1 - cmyk.k),
			gGamma = (1 - cmyk.m) * (1 - cmyk.k),
			bGamma = (1 - cmyk.y) * (1 - cmyk.k);

		const v3 = srgbToXyz(alloc3(), rGamma, gGamma, bGamma);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const rGamma = clamp(v3[0], 0, 1, unclamped),
			gGamma = clamp(v3[1], 0, 1, unclamped),
			bGamma = clamp(v3[2], 0, 1, unclamped);

		const k = 1 - Math.max(rGamma, gGamma, bGamma);

		let c = 0,
			m = 0,
			y = 0;

		if (k < 1) {
			c = (1 - rGamma - k) / (1 - k);
			m = (1 - gGamma - k) / (1 - k);
			y = (1 - bGamma - k) / (1 - k);
		}

		free3(v3);

		out.c = clamp(c, 0, 1, unclamped);
		out.m = clamp(m, 0, 1, unclamped);
		out.y = clamp(y, 0, 1, unclamped);
		out.k = clamp(k, 0, 1, unclamped);

		return out;
	},

	format: cmyk => {
		const C = Math.round(cmyk.c * 100),
			M = Math.round(cmyk.m * 100),
			Y = Math.round(cmyk.y * 100),
			K = Math.round(cmyk.k * 100);

		return `device-cmyk(${C}% ${M}% ${Y}% ${K}%)`;
	},

	expected: {
		"#000000": { c: 0.0, m: 0.0, y: 0.0, k: 1.0 },
		"#FFFFFF": { c: 0.0, m: 0.0, y: 0.0, k: 0.0 },
		"#FF0000": { c: 0.0, m: 1.0, y: 1.0, k: 0.0 },
		"#00FF00": { c: 1.0, m: 0.0, y: 1.0, k: 0.0 },
		"#0000FF": { c: 1.0, m: 1.0, y: 0.0, k: 0.0 },
		"#FFFF00": { c: 0.0, m: 0.0, y: 1.0, k: 0.0 },
		"#00FFFF": { c: 1.0, m: 0.0, y: 0.0, k: 0.0 },
		"#FF00FF": { c: 0.0, m: 1.0, y: 0.0, k: 0.0 },
		"#808080": { c: 0.0, m: 0.0, y: 0.0, k: 0.498 },
		"#FFA500": { c: 0.0, m: 0.3529, y: 1.0, k: 0.0 },
	},
};
