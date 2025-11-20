import { alloc3, free3 } from "../pool.js";
import { clamp, DEG2RAD, EPS_PRECISION, srgbToXyz, TAU, xyzToSrgb } from "../utils.js";

export default {
	name: "HSI",
	long: "Hue-Saturation-Intensity Cylindrical RGB Encoding",
	css: "hsi",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		i: { from: 0, to: 100, step: 1, round: 0, name: "Intensity", primary: true },
	},

	from: (hsi, out = {}) => {
		const h = hsi.h,
			s = hsi.s,
			i = hsi.i;

		let r, g, b;

		if (s === 0) {
			r = g = b = i;
		} else {
			const h_deg = h * 360,
				sect = Math.floor(h_deg / 120),
				h_in = h_deg - sect * 120;

			const cosH = Math.cos(h_in * DEG2RAD),
				cosA = Math.cos((60 - h_in) * DEG2RAD),
				ratio = cosA === 0 ? 0 : (s * cosH) / cosA;

			if (sect === 0) {
				b = i * (1 - s);
				r = i * (1 + ratio);
				g = 3 * i - (r + b);
			} else if (sect === 1) {
				r = i * (1 - s);
				g = i * (1 + ratio);
				b = 3 * i - (r + g);
			} else {
				g = i * (1 - s);
				b = i * (1 + ratio);
				r = 3 * i - (g + b);
			}
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

		const i = (r + g + b) / 3;

		let h, s;

		if (Math.abs(r - g) < EPS_PRECISION && Math.abs(g - b) < EPS_PRECISION) {
			h = 0;
			s = 0;
		} else {
			const alpha = 0.5 * (2 * r - g - b),
				beta = 0.8660254037844386 * (g - b);

			h = Math.atan2(beta, alpha) / TAU;

			if (h < 0) {
				h += 1;
			}

			s = i === 0 ? 0 : 1 - Math.min(r, g, b) / i;
		}

		out.h = h;
		out.s = clamp(s, 0, 1, unclamped);
		out.i = clamp(i, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, i: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, i: 1.0 },
		"#FF0000": { h: 0.0, s: 1.0, i: 0.3333 },
		"#00FF00": { h: 0.3333, s: 1.0, i: 0.3333 },
		"#0000FF": { h: 0.6667, s: 1.0, i: 0.3333 },
		"#FFFF00": { h: 0.1667, s: 1.0, i: 0.6667 },
		"#00FFFF": { h: 0.5, s: 1.0, i: 0.6667 },
		"#FF00FF": { h: 0.8333, s: 1.0, i: 0.6667 },
		"#808080": { h: 0.0, s: 0.0, i: 0.502 },
		"#FFA500": { h: 0.1093, s: 1.0, i: 0.549 },
	},
};
