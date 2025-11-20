import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "HSL",
	long: "Hue-Saturation-Lightness Cylindrical RGB Encoding (sRGB Domain)",
	css: "hsl",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness", primary: true },
	},

	from: (hsl, out = {}) => {
		const h = hsl.h,
			s = hsl.s,
			l = hsl.l;

		let r, g, b;

		if (s === 0) {
			r = g = b = l;
		} else {
			const hue2rgb = (_p, _q, t) => {
				if (t < 0) {
					t += 1;
				}

				if (t > 1) {
					t -= 1;
				}

				if (t < 1 / 6) {
					return _p + (_q - _p) * 6 * t;
				}

				if (t < 1 / 2) {
					return _q;
				}

				if (t < 2 / 3) {
					return _p + (_q - _p) * (2 / 3 - t) * 6;
				}

				return _p;
			};

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
				p = 2 * l - q;

			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
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

		let h = 0,
			s = 0,
			l = (max + min) / 2;

		if (d < EPS_PRECISION) {
			s = 0;
			h = 0;
		} else {
			if (l <= EPS_PRECISION || l >= 1 - EPS_PRECISION) {
				s = 0;
			} else {
				s = l < 0.5 ? d / (max + min) : d / (2 - max - min);
			}

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
		out.s = clamp(s, 0, 1, unclamped);
		out.l = clamp(l, 0, 1, unclamped);

		return out;
	},

	format: hsl => {
		const h = Math.round(hsl.h * 360),
			s = Math.round(hsl.s * 100),
			l = Math.round(hsl.l * 100);

		return `hsl(${h} ${s}% ${l}%)`;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, l: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, l: 1.0 },
		"#FF0000": { h: 0.0, s: 1.0, l: 0.5 },
		"#00FF00": { h: 0.33333333333333337, s: 1.0, l: 0.5 },
		"#0000FF": { h: 0.6666666666666666, s: 1.0, l: 0.5 },
		"#FFFF00": { h: 0.16666666666666663, s: 1.0, l: 0.5 },
		"#00FFFF": { h: 0.4999999999999999, s: 1.0, l: 0.5 },
		"#FF00FF": { h: 0.8333333333333333, s: 1.0, l: 0.5 },
		"#808080": { h: 0.0, s: 0.0, l: 0.5 },
		"#FFA500": { h: 0.1078, s: 1.0, l: 0.5 },
	},
};
