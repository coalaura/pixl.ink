import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, TAU, xyzToSrgb } from "../utils.js";

const U = {
	r: 3 / Math.sqrt(41),
	g: -4 / Math.sqrt(41),
	b: -4 / Math.sqrt(41),
};

const V = {
	r: -4 / Math.sqrt(861),
	g: 19 / Math.sqrt(861),
	b: -22 / Math.sqrt(861),
};

function dirFromHue(hNorm) {
	const omega = TAU * (hNorm || 0),
		c = Math.cos(omega),
		s = Math.sin(omega);

	return {
		r: U.r * c + V.r * s,
		g: U.g * c + V.g * s,
		b: U.b * c + V.b * s,
	};
}

function dMaxDirectional(m, dir) {
	let tMax = Infinity;

	if (dir.r > EPS_PRECISION) {
		tMax = Math.min(tMax, (1 - m) / dir.r);
	} else if (dir.r < -EPS_PRECISION) {
		tMax = Math.min(tMax, (0 - m) / dir.r);
	}

	if (dir.g > EPS_PRECISION) {
		tMax = Math.min(tMax, (1 - m) / dir.g);
	} else if (dir.g < -EPS_PRECISION) {
		tMax = Math.min(tMax, (0 - m) / dir.g);
	}

	if (dir.b > EPS_PRECISION) {
		tMax = Math.min(tMax, (1 - m) / dir.b);
	} else if (dir.b < -EPS_PRECISION) {
		tMax = Math.min(tMax, (0 - m) / dir.b);
	}

	if (!Number.isFinite(tMax)) {
		return 0;
	}

	return tMax > 0 ? tMax : 0;
}

export default {
	name: "HSM",
	long: "Hue-Saturation-Mixture (HSM) color space",
	css: "hsm",
	tags: ["ui_model", "experimental_model"],
	base: "sRGB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		m: { from: 0, to: 100, step: 1, round: 0, name: "Mixture", primary: true },
	},

	from: (hsm, out = {}) => {
		const h = hsm.h,
			s = hsm.s,
			m = hsm.m;

		if (s <= EPS_PRECISION) {
			const v3 = srgbToXyz(alloc3(), m, m, m);

			out.x = v3[0];
			out.y = v3[1];
			out.z = v3[2];

			free3(v3);

			return out;
		}

		const dir = dirFromHue(h),
			D = dMaxDirectional(m, dir),
			R = s * D;

		const r = m + R * dir.r,
			g = m + R * dir.g,
			b = m + R * dir.b;

		const v3b = srgbToXyz(alloc3(), r, g, b);

		out.x = v3b[0];
		out.y = v3b[1];
		out.z = v3b[2];

		free3(v3b);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const m = (4 * v3[0] + 2 * v3[1] + v3[2]) / 7;

		const dr = v3[0] - m,
			dg = v3[1] - m,
			db = v3[2] - m;

		const d2 = dr * dr + dg * dg + db * db,
			d = Math.sqrt(Math.max(0, d2));

		let h = 0;

		if (d > EPS_PRECISION) {
			const num = 3 * dr - 4 * dg - 4 * db,
				den = Math.sqrt(41 * d2),
				cosTheta = clamp(den > EPS_PRECISION ? num / den : 1, -1, 1),
				theta = Math.acos(cosTheta);

			h = (v3[2] <= v3[1] ? theta : TAU - theta) / TAU;
		}

		free3(v3);

		let s = 0;

		if (d > EPS_PRECISION) {
			const dir = dirFromHue(h),
				D = dMaxDirectional(m, dir);

			if (D > EPS_PRECISION) {
				s = d / D;
			}
		}

		out.h = clamp(h, 0, 1, unclamped);
		out.s = clamp(s, 0, 1, unclamped);
		out.m = clamp(m, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, m: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, m: 1.0 },
		"#FF0000": { h: 0.0, s: 1.0, m: 0.5714 },
		"#00FF00": { h: 0.3314, s: 1.0, m: 0.2857 },
		"#0000FF": { h: 0.651, s: 1.0, m: 0.1429 },
		"#FFFF00": { h: 0.151, s: 1.0, m: 0.8571 },
		"#00FFFF": { h: 0.5, s: 1.0, m: 0.4286 },
		"#FF00FF": { h: 0.8314, s: 1.0, m: 0.7143 },
		"#808080": { h: 0.0, s: 0.0, m: 0.502 },
		"#FFA500": { h: 0.098, s: 1.0, m: 0.7563 },
	},
};
