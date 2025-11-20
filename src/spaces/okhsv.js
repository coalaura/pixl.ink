import { alloc2, alloc3, allocObj, free2, free3, freeObj } from "../pool.js";
import { clamp, EPS_PERCEPTUAL, okComputeMaxSaturation, okToe, okToeInv, okToSt, TAU, xyzToLinearRgb } from "../utils.js";
import oklab from "./oklab.js";

function oklabToLinearRgb_viaXYZ(out, L, a, b) {
	const labN = {
		l: L,
		a: a / 0.8 + 0.5,
		b: b / 0.8 + 0.5,
	};

	const xyz = oklab.from(labN, allocObj());

	xyzToLinearRgb(out, xyz.x, xyz.y, xyz.z);

	freeObj(xyz);

	return out;
}

function findCusp(out, a, b) {
	const sCusp = okComputeMaxSaturation(a, b),
		rgb = oklabToLinearRgb_viaXYZ(alloc3(), 1, sCusp * a, sCusp * b),
		maxChan = Math.max(rgb[0], rgb[1], rgb[2], 0);

	out[0] = maxChan > 0 ? Math.pow(1 / maxChan, 1 / 3) : 0;
	out[1] = out[0] * sCusp;

	free3(rgb);

	return out;
}

function okhsvToOklab(out, hsv) {
	const h = hsv.h,
		s = hsv.s,
		v = hsv.v;

	out[0] = okToeInv(v);

	if (out[0] !== 0 && s !== 0) {
		const a_ = Math.cos(TAU * h),
			b_ = Math.sin(TAU * h);

		const cusp = findCusp(alloc2(), a_, b_);

		okToSt(cusp);

		const s0 = 0.5,
			k = 1 - s0 / cusp[0];

		const lv = 1 - (s * s0) / (s0 + cusp[1] - cusp[1] * k * s),
			cv = (s * cusp[1] * s0) / (s0 + cusp[1] - cusp[1] * k * s);

		free2(cusp);

		let l = v * lv,
			c = v * cv;

		const lvt = okToeInv(lv),
			cvt = (cv * lvt) / lv;

		const lNew = okToeInv(l);

		c = (c * lNew) / l;
		l = lNew;

		const rgbScale = oklabToLinearRgb_viaXYZ(alloc3(), lvt, a_ * cvt, b_ * cvt),
			maxc = Math.max(rgbScale[0], rgbScale[1], rgbScale[2], 0),
			scaleL = maxc > 0 ? Math.pow(1 / maxc, 1 / 3) : 1;

		free3(rgbScale);

		out[0] = l * scaleL;
		c = c * scaleL;

		out[1] = c * a_;
		out[2] = c * b_;
	} else {
		out[1] = 0;
		out[2] = 0;
	}

	return out;
}

function oklabToOkhsv(out, L, a, b) {
	out[2] = okToe(L);

	const c = Math.hypot(a, b);

	out[0] = 0.5 + Math.atan2(-b, -a) / TAU;

	if (L !== 0 && L !== 1 && c !== 0) {
		const a_ = a / c,
			b_ = b / c;

		const cusp = findCusp(alloc2(), a_, b_);

		okToSt(cusp);

		const s0 = 0.5,
			k = 1 - s0 / cusp[0];

		const t = cusp[1] / (c + L * cusp[1]),
			lv = t * L,
			cv = t * c;

		const lvt = okToeInv(lv),
			cvt = (cv * lvt) / lv;

		const rgbScale = oklabToLinearRgb_viaXYZ(alloc3(), lvt, a_ * cvt, b_ * cvt),
			maxc = Math.max(rgbScale[0], rgbScale[1], rgbScale[2], 0),
			scaleL = maxc > 0 ? Math.pow(1 / maxc, 1 / 3) : 1;

		free3(rgbScale);

		L = L / scaleL;

		let c2 = c / scaleL;

		c2 = (c2 * okToe(L)) / L;
		L = okToe(L);

		out[2] = L / lv;
		out[1] = ((s0 + cusp[1]) * cv) / (cusp[1] * s0 + cusp[1] * k * cv);

		free2(cusp);
	} else {
		out[1] = 0;
	}

	if (Math.abs(out[1]) < EPS_PERCEPTUAL || out[2] === 0) {
		out[0] = 0;
	}

	return out;
}

export default {
	name: "OKHSV",
	long: "OKHSV - Perceptual HSV (Ottosson) via OKLab",
	css: "okhsv",
	tags: ["ui_model", "cylindrical_model", "perceptual_uniform"],
	base: "OKLab",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		v: { from: 0, to: 100, step: 1, round: 0, name: "Value", primary: true },
	},

	from: (hsv, out = {}) => {
		const v3 = okhsvToOklab(alloc3(), hsv);

		const labN = {
			l: v3[0],
			a: v3[1] / 0.8 + 0.5,
			b: v3[2] / 0.8 + 0.5,
		};

		free3(v3);

		return oklab.from(labN, out);
	},
	to: (xyz, out = {}, unclamped = false) => {
		const labN = oklab.to(xyz, allocObj(), true);

		const L = labN.l,
			a = (labN.a - 0.5) * 0.8,
			b = (labN.b - 0.5) * 0.8;

		freeObj(labN);

		const v3 = oklabToOkhsv(alloc3(), L, a, b);

		out.h = clamp(v3[0], 0, 1, unclamped);
		out.s = clamp(v3[1], 0, 1, unclamped);
		out.v = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { h: 0, s: 0, v: 0 },
		"#FFFFFF": { h: 0, s: 0, v: 1 },
		"#FF0000": { h: 0.0812, s: 0.9995, v: 1 },
		"#00FF00": { h: 0.3958, s: 1, v: 1 },
		"#0000FF": { h: 0.7335, s: 1, v: 1 },
		"#FFFF00": { h: 0.3049, s: 1, v: 1 },
		"#00FFFF": { h: 0.541, s: 1, v: 1 },
		"#FF00FF": { h: 0.9121, s: 1, v: 1 },
		"#808080": { h: 0, s: 0, v: 0.5357 },
		"#FFA500": { h: 0.1963, s: 1, v: 1 },
	},
};
