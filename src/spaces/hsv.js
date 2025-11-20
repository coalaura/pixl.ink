import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "HSV",
	long: "Hue-Saturation-Value Cylindrical RGB Encoding",
	css: "hsv",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		v: { from: 0, to: 100, step: 1, round: 0, name: "Value", primary: true },
	},

	from: (hsv, out = {}) => {
		const h = hsv.h,
			s = hsv.s,
			v = hsv.v;

		let r, g, b;

		const i = Math.floor(h * 6),
			f = h * 6 - i,
			p = v * (1 - s),
			q = v * (1 - f * s),
			t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}

		const v3 = srgbToXyz(alloc3(), r, g, b);

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

		const v = max,
			s = max === 0 ? 0 : d / max;

		if (s <= EPS_PRECISION) {
			out.h = 0;
			out.s = 0;
			out.v = v;

			return out;
		}

		let h;

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

		out.h = h;
		out.s = s;
		out.v = v;

		return out;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, v: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, v: 1.0 },
		"#FF0000": { h: 0.0, s: 1.0, v: 1.0 },
		"#00FF00": { h: 0.3333, s: 1.0, v: 1.0 },
		"#0000FF": { h: 0.6667, s: 1.0, v: 1.0 },
		"#FFFF00": { h: 0.1667, s: 1.0, v: 1.0 },
		"#00FFFF": { h: 0.5, s: 1.0, v: 1.0 },
		"#FF00FF": { h: 0.8333, s: 1.0, v: 1.0 },
		"#808080": { h: 0.0, s: 0.0, v: 0.502 },
		"#FFA500": { h: 0.1078, s: 1.0, v: 1.0 },
	},
};
