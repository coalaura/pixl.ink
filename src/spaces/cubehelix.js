import { alloc3, free3 } from "../pool.js";
import { clamp, DEG2RAD, EPS_PRECISION, normalizeAngle360, RAD2DEG, srgbToXyz, xyzToSrgb } from "../utils.js";

const A = -0.14861,
	B = 1.78277,
	C = -0.29227,
	D = -0.90649,
	E = 1.97294;

const ED = E * D,
	EB = E * B,
	BC_DA = B * C - D * A;

const S_MAX = 4.614386868039719;

export default {
	name: "Cubehelix",
	long: "Cubehelix (Dave Green) - H-S-L with monotonic lightness (sRGB domain)",
	css: "cubehelix",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: S_MAX, step: 0.001, round: 3, name: "Saturation" },
		l: { from: 0, to: 1, step: 0.001, round: 3, name: "Lightness", primary: true },
	},

	from: (hsl, out = {}) => {
		const hDeg = hsl.h * 360,
			sPhys = hsl.s * S_MAX,
			l = hsl.l;

		const sUse = l === 0 || l === 1 ? 0 : sPhys;

		const hRad = (hDeg + 120) * DEG2RAD,
			cosh = Math.cos(hRad),
			sinh = Math.sin(hRad);

		const a = sUse * l * (1 - l);

		const r = l + a * (A * cosh + B * sinh),
			g = l + a * (C * cosh + D * sinh),
			b = l + a * (E * cosh);

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

		const denomL = BC_DA + ED - EB;

		let l = 0;

		if (Math.abs(denomL) > EPS_PRECISION) {
			l = (BC_DA * b + ED * r - EB * g) / denomL;
		}

		l = clamp(l, 0, 1, unclamped);

		const bl = b - l;

		const k = Math.abs(D) > EPS_PRECISION ? (E * (g - l) - C * bl) / D : 0;

		let sPhys = 0;

		if (l > 0 && l < 1) {
			const amp = Math.hypot(k, bl),
				denomS = E * l * (1 - l);

			if (denomS > EPS_PRECISION) {
				sPhys = amp / denomS;
			}
		}

		let hDeg = 0;

		if (sPhys > EPS_PRECISION) {
			hDeg = Math.atan2(k, bl) * RAD2DEG - 120;
			hDeg = normalizeAngle360(hDeg);
		}

		const hOut = hDeg / 360,
			sOut = Math.max(0, sPhys / S_MAX),
			lOut = l;

		out.h = clamp(hOut, 0, 1, unclamped);
		out.s = clamp(sOut, 0, 1, unclamped);
		out.l = clamp(lOut, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, l: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, l: 1.0 },
		"#FF0000": { h: 0.9773, s: 0.4224, l: 0.3 },
		"#00FF00": { h: 0.3054, s: 0.4164, l: 0.59 },
		"#0000FF": { h: 0.6582, s: 1.0, l: 0.11 },
		"#FFFF00": { h: 0.1582, s: 1.0, l: 0.89 },
		"#00FFFF": { h: 0.4773, s: 0.4224, l: 0.7 },
		"#FF00FF": { h: 0.8054, s: 0.4164, l: 0.41 },
		"#808080": { h: 0.0, s: 0.0, l: 0.502 },
		"#FFA500": { h: 0.1016, s: 0.3762, l: 0.6818 },
	},
};
