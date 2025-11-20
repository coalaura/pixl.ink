import { alloc2, alloc3, allocObj, free2, free3, freeObj } from "../pool.js";
import { clamp, EPS_PERCEPTUAL, LMS_TO_SRGB_LINEAR_MATRIX, OKLAB_TO_LMS_PRIME_MATRIX, okComputeMaxSaturation, okToe, okToeInv, okToSt, TAU, xyzToLinearRgb } from "../utils.js";
import oklab from "./oklab.js";

function oklabToLinearRgb_viaXYZ(out, L, a, b) {
	const labN = {
		l: L,
		a: a / 0.8 + 0.5,
		b: b / 0.8 + 0.5,
	};

	const xyz = oklab.from(labN);

	return xyzToLinearRgb(out, xyz.x, xyz.y, xyz.z);
}

function vdot(a1, a2, a3, b1, b2, b3) {
	return a1 * b1 + a2 * b2 + a3 * b3;
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

function findGamutIntersection(a, b, l1, c1, l0, cusp) {
	let t;

	if ((l1 - l0) * cusp[1] - (cusp[0] - l0) * c1 <= 0) {
		t = (cusp[1] * l0) / (c1 * cusp[0] + cusp[1] * (l0 - l1));
	} else {
		t = (cusp[1] * (l0 - 1)) / (c1 * (cusp[0] - 1) + cusp[1] * (l0 - l1));

		const dl = l1 - l0,
			dc = c1;

		const kl = OKLAB_TO_LMS_PRIME_MATRIX[1] * a + OKLAB_TO_LMS_PRIME_MATRIX[2] * b,
			km = OKLAB_TO_LMS_PRIME_MATRIX[4] * a + OKLAB_TO_LMS_PRIME_MATRIX[5] * b,
			ks = OKLAB_TO_LMS_PRIME_MATRIX[7] * a + OKLAB_TO_LMS_PRIME_MATRIX[8] * b;

		const ldt_ = dl + dc * kl,
			mdt_ = dl + dc * km,
			sdt_ = dl + dc * ks;

		const L = l0 * (1 - t) + t * l1,
			C = t * c1;

		const l_ = L + C * kl,
			m_ = L + C * km,
			s_ = L + C * ks;

		const l = l_ ** 3,
			m = m_ ** 3,
			s = s_ ** 3;

		const ldt = 3 * ldt_ * l_ ** 2,
			mdt = 3 * mdt_ * m_ ** 2,
			sdt = 3 * sdt_ * s_ ** 2;

		const ldt2 = 6 * ldt_ * ldt_ * l_,
			mdt2 = 6 * mdt_ * mdt_ * m_,
			sdt2 = 6 * sdt_ * sdt_ * s_;

		const r_ = vdot(LMS_TO_SRGB_LINEAR_MATRIX[0], LMS_TO_SRGB_LINEAR_MATRIX[1], LMS_TO_SRGB_LINEAR_MATRIX[2], l, m, s) - 1,
			r1 = vdot(LMS_TO_SRGB_LINEAR_MATRIX[0], LMS_TO_SRGB_LINEAR_MATRIX[1], LMS_TO_SRGB_LINEAR_MATRIX[2], ldt, mdt, sdt),
			r2 = vdot(LMS_TO_SRGB_LINEAR_MATRIX[0], LMS_TO_SRGB_LINEAR_MATRIX[1], LMS_TO_SRGB_LINEAR_MATRIX[2], ldt2, mdt2, sdt2);

		const g_ = vdot(LMS_TO_SRGB_LINEAR_MATRIX[3], LMS_TO_SRGB_LINEAR_MATRIX[4], LMS_TO_SRGB_LINEAR_MATRIX[5], l, m, s) - 1,
			g1 = vdot(LMS_TO_SRGB_LINEAR_MATRIX[3], LMS_TO_SRGB_LINEAR_MATRIX[4], LMS_TO_SRGB_LINEAR_MATRIX[5], ldt, mdt, sdt),
			g2 = vdot(LMS_TO_SRGB_LINEAR_MATRIX[3], LMS_TO_SRGB_LINEAR_MATRIX[4], LMS_TO_SRGB_LINEAR_MATRIX[5], ldt2, mdt2, sdt2);

		const b_ = vdot(LMS_TO_SRGB_LINEAR_MATRIX[6], LMS_TO_SRGB_LINEAR_MATRIX[7], LMS_TO_SRGB_LINEAR_MATRIX[8], l, m, s) - 1,
			b1 = vdot(LMS_TO_SRGB_LINEAR_MATRIX[6], LMS_TO_SRGB_LINEAR_MATRIX[7], LMS_TO_SRGB_LINEAR_MATRIX[8], ldt, mdt, sdt),
			b2 = vdot(LMS_TO_SRGB_LINEAR_MATRIX[6], LMS_TO_SRGB_LINEAR_MATRIX[7], LMS_TO_SRGB_LINEAR_MATRIX[8], ldt2, mdt2, sdt2);

		const ur = r1 / (r1 * r1 - 0.5 * r_ * r2),
			ug = g1 / (g1 * g1 - 0.5 * g_ * g2),
			ub = b1 / (b1 * b1 - 0.5 * b_ * b2);

		let tr = -r_ * ur,
			tg = -g_ * ug,
			tb = -b_ * ub;

		if (ur < 0) {
			tr = Number.MAX_VALUE;
		}
		if (ug < 0) {
			tg = Number.MAX_VALUE;
		}
		if (ub < 0) {
			tb = Number.MAX_VALUE;
		}

		t += Math.min(tr, tg, tb);
	}

	return t;
}

function getStMid(a, b) {
	const s =
		0.11516993 +
		1.0 / (7.4477897 + 4.1590124 * b + a * (-2.19557347 + 1.75198401 * b + a * (-2.13704948 - 10.02301043 * b + a * (-4.24894561 + 5.38770819 * b + 4.69891013 * a))));

	const t =
		0.11239642 +
		1.0 / (1.6132032 + -0.68124379 * b + a * (0.40370612 + 0.90148123 * b + a * (-0.27087943 + 0.6122399 * b + a * (0.00299215 - 0.45399568 * b - 0.14661872 * a))));

	return [s, t];
}

function getCs(out, l, a, b) {
	const cusp = findCusp(alloc2(), a, b);

	out[2] = findGamutIntersection(a, b, l, 1, l, cusp);

	okToSt(cusp);

	const k = out[2] / Math.min(l * cusp[0], (1 - l) * cusp[1]);

	free2(cusp);

	const [sMid, tMid] = getStMid(a, b);

	let ca = l * sMid,
		cb = (1 - l) * tMid;

	out[1] = 0.9 * k * Math.sqrt(Math.sqrt(1.0 / (1.0 / (ca * ca * ca * ca) + 1.0 / (cb * cb * cb * cb))));

	ca = l * 0.4;
	cb = (1 - l) * 0.8;

	out[0] = Math.sqrt(1.0 / (1.0 / (ca * ca) + 1.0 / (cb * cb)));

	return out;
}

function okhslToOklab(out, hsl) {
	const h = hsl.h,
		s = hsl.s;

	out[0] = okToeInv(hsl.l);

	if (out[0] !== 0.0 && out[0] !== 1.0 && s !== 0.0) {
		const a_ = Math.cos(TAU * h),
			b_ = Math.sin(TAU * h);

		const cMM = getCs(alloc3(), out[0], a_, b_);

		const mid = 0.8,
			midInv = 1.25;

		let c;

		if (s < mid) {
			const t = midInv * s,
				k0 = 0.0,
				k1 = mid * cMM[0],
				k2 = 1.0 - k1 / cMM[1];

			c = k0 + (t * k1) / (1.0 - k2 * t);
		} else {
			const t = 5 * (s - 0.8),
				k0 = cMM[1],
				k1 = (0.2 * cMM[1] * cMM[1] * midInv * midInv) / cMM[0],
				k2 = 1.0 - k1 / (cMM[2] - cMM[1]);

			c = k0 + (t * k1) / (1.0 - k2 * t);
		}

		free3(cMM);

		out[1] = c * a_;
		out[2] = c * b_;
	} else {
		out[1] = 0;
		out[2] = 0;
	}

	return out;
}

function oklabToOkhsl(out, L, a, b) {
	out[2] = okToe(L);

	const c = Math.hypot(a, b);

	out[0] = 0.5 + Math.atan2(-b, -a) / TAU;

	if (out[2] !== 0.0 && Math.abs(1 - out[2]) > EPS_PERCEPTUAL && c !== 0.0) {
		const a_ = a / c,
			b_ = b / c;

		const cMM = getCs(alloc3(), L, a_, b_);

		const mid = 0.8,
			midInv = 1.25;

		if (c < cMM[1]) {
			const k1 = mid * cMM[0],
				k2 = 1.0 - k1 / cMM[1],
				t = c / (k1 + k2 * c);

			out[1] = t * mid;
		} else {
			const k0 = cMM[1],
				k1 = (0.2 * cMM[1] * cMM[1] * midInv * midInv) / cMM[0],
				k2 = 1.0 - k1 / (cMM[2] - cMM[1]),
				t = (c - k0) / (k1 + k2 * (c - k0));

			out[1] = mid + 0.2 * t;
		}

		free3(cMM);
	} else {
		out[1] = 0;
	}

	const achromatic = Math.abs(out[1]) < EPS_PERCEPTUAL;

	if (achromatic || out[2] === 0.0 || Math.abs(1 - out[2]) < EPS_PERCEPTUAL) {
		out[0] = 0;

		if (!achromatic) {
			out[1] = 0;
		}
	}

	return out;
}

export default {
	name: "OKHSL",
	long: "OKHSL - Perceptual HSL (Ottosson) via OKLab",
	css: "okhsl",
	tags: ["ui_model", "cylindrical_model", "perceptual_uniform"],
	base: "OKLab",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		s: { from: 0, to: 100, step: 1, round: 0, name: "Saturation" },
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness", primary: true },
	},

	from: (hsl, out = {}) => {
		const v3 = okhslToOklab(alloc3(), hsl);

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

		const v3 = oklabToOkhsl(alloc3(), L, a, b);

		out.h = clamp(v3[0], 0, 1, unclamped);
		out.s = clamp(v3[1], 0, 1, unclamped);
		out.l = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { h: 0, s: 0, l: 0 },
		"#FFFFFF": { h: 0, s: 0, l: 1 },
		"#FF0000": { h: 0.0812, s: 1, l: 0.5681 },
		"#00FF00": { h: 0.3958, s: 1, l: 0.8445 },
		"#0000FF": { h: 0.7335, s: 1, l: 0.3666 },
		"#FFFF00": { h: 0.3049, s: 1, l: 0.9627 },
		"#00FFFF": { h: 0.541, s: 1, l: 0.8898 },
		"#FF00FF": { h: 0.9121, s: 1, l: 0.6533 },
		"#808080": { h: 0, s: 0, l: 0.5357 },
		"#FFA500": { h: 0.1963, s: 1, l: 0.7588 },
	},
};
