import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "HWB",
	long: "Hue-Whiteness-Blackness (CSS Color Level 4)",
	css: "hwb",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		w: { from: 0, to: 100, step: 1, round: 0, name: "Whiteness", primary: true },
		b: { from: 0, to: 100, step: 1, round: 0, name: "Blackness" },
	},

	from: (hwb, out = {}) => {
		let h = hwb.h,
			w = hwb.w,
			b = hwb.b;

		const sum = w + b;

		if (sum > 1) {
			w /= sum;
			b /= sum;
		}

		const i = Math.floor(h * 6),
			f = h * 6 - i;

		const q = 1 - f,
			t = f,
			p = 0;

		let r, g, bb;

		switch (i % 6) {
			case 0:
				r = 1;
				g = t;
				bb = p;
				break;
			case 1:
				r = q;
				g = 1;
				bb = p;
				break;
			case 2:
				r = p;
				g = 1;
				bb = t;
				break;
			case 3:
				r = p;
				g = q;
				bb = 1;
				break;
			case 4:
				r = t;
				g = p;
				bb = 1;
				break;
			case 5:
				r = 1;
				g = p;
				bb = q;
				break;
		}

		r = r * (1 - w - b) + w;
		g = g * (1 - w - b) + w;
		bb = bb * (1 - w - b) + w;

		const v3 = srgbToXyz(alloc3(), r, g, bb);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const r = clamp(v3[0], 0, 1, unclamped),
			g = clamp(v3[1], 0, 1, unclamped),
			b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		const max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			d = max - min;

		let h = 0;

		if (d > EPS_PRECISION) {
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}

			h /= 6;
		}

		out.h = h;

		out.w = clamp(min, 0, 1);
		out.b = clamp(1 - max, 0, 1);

		return out;
	},

	format: hwb => {
		const h = Math.round(hwb.h * 360),
			w = Math.round(hwb.w * 100),
			b = Math.round(hwb.b * 100);

		return `hwb(${h} ${w}% ${b}%)`;
	},

	expected: {
		"#000000": { h: 0.0, w: 0.0, b: 1.0 },
		"#FFFFFF": { h: 0.0, w: 1.0, b: 0.0 },
		"#FF0000": { h: 0.0, w: 0.0, b: 0.0 },
		"#00FF00": { h: 0.3333, w: 0.0, b: 0.0 },
		"#0000FF": { h: 0.6667, w: 0.0, b: 0.0 },
		"#FFFF00": { h: 0.1667, w: 0.0, b: 0.0 },
		"#00FFFF": { h: 0.5, w: 0.0, b: 0.0 },
		"#FF00FF": { h: 0.8333, w: 0.0, b: 0.0 },
		"#808080": { h: 0.0, w: 0.502, b: 0.498 },
		"#FFA500": { h: 0.1078, w: 0.0, b: 0.0 },
	},
};
