import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, LUMA_BT601, srgbToXyz, xyzToSrgb } from "../utils.js";

const { KR, KG, KB } = LUMA_BT601;

export default {
	name: "HSP",
	long: "Hue-Saturation-Perceived Brightness (Luma-Weighted RGB Encoding)",
	css: "hsp",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		p: { from: 0, to: 100, step: 1, round: 0, name: "Perceived Brightness", primary: true },
	},

	from: (hsp, out = {}) => {
		const H = hsp.h,
			S = hsp.s,
			P = hsp.p;

		if (S === 0) {
			const v3 = srgbToXyz(alloc3(), P, P, P);

			out.x = v3[0];
			out.y = v3[1];
			out.z = v3[2];

			free3(v3);

			return out;
		}

		const minOverMax = 1 - S;

		let R,
			G,
			B,
			part,
			h = H * 6;

		if (minOverMax > 0) {
			if (h < 1) {
				part = 1 + h * (1 / minOverMax - 1);
				B = P / Math.sqrt(KR / (minOverMax * minOverMax) + KG * part * part + KB);
				R = B / minOverMax;
				G = B + h * (R - B);
			} else if (h < 2) {
				h = 2 - h;
				part = 1 + h * (1 / minOverMax - 1);
				B = P / Math.sqrt(KG / (minOverMax * minOverMax) + KR * part * part + KB);
				G = B / minOverMax;
				R = B + h * (G - B);
			} else if (h < 3) {
				h -= 2;
				part = 1 + h * (1 / minOverMax - 1);
				R = P / Math.sqrt(KG / (minOverMax * minOverMax) + KB * part * part + KR);
				G = R / minOverMax;
				B = R + h * (G - R);
			} else if (h < 4) {
				h = 4 - h;
				part = 1 + h * (1 / minOverMax - 1);
				R = P / Math.sqrt(KB / (minOverMax * minOverMax) + KG * part * part + KR);
				B = R / minOverMax;
				G = R + h * (B - R);
			} else if (h < 5) {
				h -= 4;
				part = 1 + h * (1 / minOverMax - 1);
				G = P / Math.sqrt(KB / (minOverMax * minOverMax) + KR * part * part + KG);
				B = G / minOverMax;
				R = G + h * (B - G);
			} else {
				h = 6 - h;
				part = 1 + h * (1 / minOverMax - 1);
				G = P / Math.sqrt(KR / (minOverMax * minOverMax) + KB * part * part + KG);
				R = G / minOverMax;
				B = G + h * (R - G);
			}
		} else {
			if (h < 1) {
				R = Math.sqrt((P * P) / (KR + KG * h * h));
				G = R * h;
				B = 0;
			} else if (h < 2) {
				h = 2 - h;
				G = Math.sqrt((P * P) / (KG + KR * h * h));
				R = G * h;
				B = 0;
			} else if (h < 3) {
				h -= 2;
				G = Math.sqrt((P * P) / (KG + KB * h * h));
				B = G * h;
				R = 0;
			} else if (h < 4) {
				h = 4 - h;
				B = Math.sqrt((P * P) / (KB + KG * h * h));
				G = B * h;
				R = 0;
			} else if (h < 5) {
				h -= 4;
				B = Math.sqrt((P * P) / (KB + KR * h * h));
				R = B * h;
				G = 0;
			} else {
				h = 6 - h;
				R = Math.sqrt((P * P) / (KR + KB * h * h));
				B = R * h;
				G = 0;
			}
		}

		const v3b = srgbToXyz(alloc3(), R, G, B);

		out.x = v3b[0];
		out.y = v3b[1];
		out.z = v3b[2];

		free3(v3b);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const r = clamp(v3[0], 0, 1, unclamped),
			g = clamp(v3[1], 0, 1, unclamped),
			b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		const P = Math.sqrt(r * r * KR + g * g * KG + b * b * KB);

		let H = 0,
			S = 0;

		if (r === g && g === b) {
			S = 0;
			H = 0;
		} else if (r >= g && r >= b) {
			H = b >= g ? 1 - (b - g) / (6 * (r - g)) : (g - b) / (6 * (r - b));
			S = 1 - Math.min(g, b) / r;
		} else if (g >= r && g >= b) {
			H = r >= b ? 1 / 3 - (r - b) / (6 * (g - b)) : 1 / 3 + (b - r) / (6 * (g - r));
			S = 1 - Math.min(r, b) / g;
		} else {
			H = g >= r ? 2 / 3 - (g - r) / (6 * (b - r)) : 2 / 3 + (r - g) / (6 * (b - g));
			S = 1 - Math.min(r, g) / b;
		}

		if (H < 0) {
			H += 1;
		}

		if (S < EPS_PRECISION) {
			H = 0;
		}

		out.h = H;
		out.s = clamp(S, 0, 1, unclamped);
		out.p = clamp(P, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, p: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, p: 1.0 },
		"#FF0000": { h: 0.0, s: 1.0, p: 0.547 },
		"#00FF00": { h: 0.3333, s: 1.0, p: 0.7659 },
		"#0000FF": { h: 0.6667, s: 1.0, p: 0.3373 },
		"#FFFF00": { h: 0.1667, s: 1.0, p: 0.9413 },
		"#00FFFF": { h: 0.5, s: 1.0, p: 0.8372 },
		"#FF00FF": { h: 0.8333, s: 1.0, p: 0.642 },
		"#808080": { h: 0.0, s: 0.0, p: 0.502 },
		"#FFA500": { h: 0.1093, s: 1.0, p: 0.738 },
	},
};
