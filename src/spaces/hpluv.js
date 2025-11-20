import { clamp, DEG2RAD, EPS_PERCEPTUAL, EPS_PRECISION, hsLuvBounds, RAD2DEG } from "../utils.js";
import cieluv from "./cieluv.js";

function distanceLineFromOrigin(slope, intercept) {
	return Math.abs(intercept) / Math.sqrt(slope * slope + 1);
}

function maxSafeChromaForL(L) {
	const bounds = hsLuvBounds(L);

	let minDist = Infinity;

	for (const line of bounds) {
		const dist = distanceLineFromOrigin(line.slope, line.intercept);

		if (Number.isFinite(dist) && dist >= 0 && dist < minDist) {
			minDist = dist;
		}
	}

	return minDist === Infinity ? 0 : minDist;
}

const defaults = cieluv.bake();

export default {
	name: "HPLuv",
	long: "HPLuv - Pastel HSL (CIELUV with lightness-only gamut scaling)",
	css: "hpluv",
	tags: ["ui_model", "perceptual_uniform", "cylindrical_model"],
	base: "CIELUV",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		p: { from: 0, to: 100, step: 1, round: 0, name: "Perceptual Saturation P" },
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness", primary: true },
	},

	options: cieluv.options,
	bake: cieluv.bake,

	from: (hpluv, out = {}, params = defaults) => {
		let L = hpluv.l * 100;

		const Hdeg = hpluv.h * 360,
			Ppct = hpluv.p * 100;

		if (L > 100 - EPS_PRECISION) {
			L = 100;
		} else if (L < EPS_PRECISION) {
			L = 0;
		}

		let uStar = 0,
			vStar = 0;

		if (L > EPS_PRECISION && L < 100 - EPS_PRECISION && Ppct > EPS_PRECISION) {
			const cMax = maxSafeChromaForL(L),
				C = (cMax * Ppct) / 100;

			const hRad = Hdeg * DEG2RAD;

			uStar = C * Math.cos(hRad);
			vStar = C * Math.sin(hRad);
		}

		return cieluv.from(
			{
				l: L / 100,
				u: uStar / 430 + 0.5,
				v: vStar / 430 + 0.5,
			},
			out,
			params
		);
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const luv = cieluv.to(xyz, {}, true, params);

		let L = luv.l * 100;

		const uStar = (luv.u - 0.5) * 430,
			vStar = (luv.v - 0.5) * 430;

		if (L > 100 - EPS_PRECISION) {
			L = 100;
		} else if (L < EPS_PRECISION) {
			L = 0;
		}

		const C = Math.hypot(uStar, vStar);

		let Hdeg = 0;

		if (C > EPS_PRECISION) {
			Hdeg = Math.atan2(vStar, uStar) * RAD2DEG;

			if (Hdeg < 0) {
				Hdeg += 360;
			}
		}

		let Ppct = 0;

		if (L > EPS_PRECISION && L < 100 - EPS_PRECISION && C > EPS_PRECISION) {
			const cMax = maxSafeChromaForL(L);

			if (cMax > EPS_PRECISION) {
				Ppct = (C / cMax) * 100;
			}
		}

		const Pnorm = Ppct / 100;

		const achromatic = Pnorm <= EPS_PERCEPTUAL || L <= EPS_PRECISION || L >= 100 - EPS_PRECISION;

		out.h = clamp(achromatic ? 0 : Hdeg / 360, 0, 1, unclamped);
		out.p = clamp(Pnorm, 0, 1, unclamped);
		out.l = clamp(L / 100, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { h: 0.0, p: 0.0, l: 0.0 },
		"#FFFFFF": { h: 0.0, p: 0.0, l: 1.0 },
		"#FF0000": { h: 0.0338, p: 4.2675, l: 0.5324 },
		"#00FF00": { h: 0.3548, p: 4.9015, l: 0.8774 },
		"#0000FF": { h: 0.7385, p: 5.1341, l: 0.323 },
		"#FFFF00": { h: 0.2385, p: 17.8424, l: 0.9714 },
		"#00FFFF": { h: 0.5338, p: 3.6919, l: 0.9111 },
		"#FF00FF": { h: 0.8548, p: 2.8904, l: 0.6032 },
		"#808080": { h: 0.0, p: 0.0, l: 0.5359 },
		"#FFA500": { h: 0.1241, p: 1.7824, l: 0.7493 },
	},
};
