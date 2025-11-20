import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, TAU, xyzToSrgb } from "../utils.js";

export default {
	name: "TSL",
	long: "TSL - Tint, Saturation, Lightness",
	css: "tsl",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		t: { from: 0, to: 360, step: 1, round: 0, name: "Tint (deg)" },
		s: { from: 0, to: 1, step: 0.001, round: 3, name: "Saturation" },
		l: { from: 0, to: 1, step: 0.001, round: 3, name: "Lightness", primary: true },
	},

	from: (tsl, out = {}) => {
		const T = tsl.t,
			S = tsl.s,
			L = tsl.l;

		const theta = (0.5 - T) * TAU,
			cosT = Math.cos(theta),
			sinT = Math.sin(theta),
			m = (Math.sqrt(5) / 3) * S;

		const denom = 1 / 3 + m * (0.185 * cosT + 0.473 * sinT),
			sum = Math.abs(denom) > EPS_PRECISION ? L / denom : 0;

		const R = sum * (1 / 3 + m * cosT),
			G = sum * (1 / 3 + m * sinT),
			B = sum * (1 / 3 - m * (cosT + sinT));

		const xyz = srgbToXyz(alloc3(), R, G, B);

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

		const sum = r + g + b,
			inv = Math.abs(sum) > EPS_PRECISION ? 1 / sum : 0;

		const r_ = r * inv - 1 / 3,
			g_ = g * inv - 1 / 3;

		let T = 0;

		if (Math.abs(r_) > EPS_PRECISION || Math.abs(g_) > EPS_PRECISION) {
			const theta = Math.atan2(g_, r_);

			T = 0.5 - theta / TAU;
		}

		const S = Math.sqrt((9 / 5) * (r_ * r_ + g_ * g_)),
			L = 0.299 * r + 0.587 * g + 0.114 * b;

		out.t = clamp(T, 0, 1, unclamped);
		out.s = clamp(S, 0, 1, unclamped);
		out.l = clamp(L, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { t: 0.875, s: 0.6325, l: 0 },
		"#FFFFFF": { t: 0.0, s: 0.0, l: 1.0 },
		"#FF0000": { t: 0.5738, s: 1.0, l: 0.299 },
		"#00FF00": { t: 0.1762, s: 1.0, l: 0.587 },
		"#0000FF": { t: 0.875, s: 0.6325, l: 0.114 },
		"#FFFF00": { t: 0.375, s: 0.3162, l: 0.886 },
		"#00FFFF": { t: 0.0738, s: 0.5, l: 0.701 },
		"#FF00FF": { t: 0.6762, s: 0.5, l: 0.413 },
		"#808080": { t: 0.0, s: 0.0, l: 0.502 },
		"#FFA500": { t: 0.4659, s: 0.3759, l: 0.6788 },
	},
};
