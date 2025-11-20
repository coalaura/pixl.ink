import { clamp, DEG2RAD, EPS_PERCEPTUAL, EPS_PRECISION, hsLuvBounds, RAD2DEG } from "../utils.js";
import cieluv from "./cieluv.js";

function lengthOfRayUntilIntersect(theta, line) {
	const denom = Math.sin(theta) - line.slope * Math.cos(theta);

	if (Math.abs(denom) < EPS_PRECISION) {
		return Infinity;
	}

	return line.intercept / denom;
}

function maxChromaForLH(L, hDeg) {
	const hRad = hDeg * DEG2RAD,
		bounds = hsLuvBounds(L);

	let minLen = Infinity;

	for (const line of bounds) {
		const len = lengthOfRayUntilIntersect(hRad, line);

		if (Number.isFinite(len) && len >= 0 && len < minLen) {
			minLen = len;
		}
	}

	return minLen === Infinity ? 0 : minLen;
}

function lchuvToXyz(outObj, L, C, hDeg) {
	const hRad = hDeg * DEG2RAD,
		uStar = C * Math.cos(hRad),
		vStar = C * Math.sin(hRad);

	return cieluv.from(
		{
			l: L / 100,
			u: uStar / 430 + 0.5,
			v: vStar / 430 + 0.5,
		},
		outObj
	);
}

const defaults = cieluv.bake();

export default {
	name: "HSLuv",
	long: "HSLuv - Human-friendly HSL (CIELUV LCh with analytic gamut scaling)",
	css: "hsluv",
	tags: ["ui_model", "perceptual_uniform", "cylindrical_model"],
	base: "CIELUV",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness", primary: true },
	},

	options: cieluv.options,
	bake: cieluv.bake,

	from: (hsluv, out = {}, params = defaults) => {
		const H = hsluv.h * 360,
			S = hsluv.s * 100,
			L = hsluv.l * 100;

		if (L <= EPS_PRECISION || 100 - L <= EPS_PRECISION || S <= EPS_PRECISION) {
			return cieluv.from(
				{
					l: L / 100,
					u: 0.5,
					v: 0.5,
				},
				out,
				params
			);
		}

		const Cmax = maxChromaForLH(L, H),
			C = (S / 100) * Cmax;

		return lchuvToXyz(out, L, C, H);
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const luvN = cieluv.to(xyz, {}, true, params);

		const L = luvN.l * 100,
			uStar = (luvN.u - 0.5) * 430,
			vStar = (luvN.v - 0.5) * 430;

		const C = Math.hypot(uStar, vStar);

		let hDeg = 0;

		if (C > EPS_PRECISION) {
			hDeg = Math.atan2(vStar, uStar) * RAD2DEG;

			if (hDeg < 0) {
				hDeg += 360;
			}
		}

		let S = 0;

		if (C > EPS_PRECISION && L > EPS_PRECISION && 100 - L > EPS_PRECISION) {
			const Cmax = maxChromaForLH(L, hDeg);

			if (Cmax > EPS_PRECISION) {
				S = (C / Cmax) * 100;
			}
		}

		const sNorm = S / 100;

		const achromatic = sNorm <= EPS_PERCEPTUAL || C <= EPS_PRECISION;

		out.h = clamp(achromatic ? 0 : hDeg / 360, 0, 1, unclamped);
		out.s = clamp(sNorm, 0, 1, unclamped);
		out.l = clamp(L / 100, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { h: 0.0, s: 0.0, l: 0.0 },
		"#FFFFFF": { h: 0.0, s: 0.0, l: 1.0 },
		"#FF0000": { h: 0.0338, s: 1.0, l: 0.5324 },
		"#00FF00": { h: 0.3548, s: 1.0, l: 0.8774 },
		"#0000FF": { h: 0.7385, s: 1.0, l: 0.323 },
		"#FFFF00": { h: 0.2385, s: 1.0076, l: 0.9714 },
		"#00FFFF": { h: 0.5338, s: 1.0, l: 0.9111 },
		"#FF00FF": { h: 0.8548, s: 1.0, l: 0.6032 },
		"#808080": { h: 0.0, s: 0.0, l: 0.5359 },
		"#FFA500": { h: 0.1241, s: 1.0, l: 0.7493 },
	},
};
