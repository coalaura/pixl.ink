import { alloc3, free3 } from "../pool.js";
import { clamp, DEG2RAD, EPS_PRECISION } from "../utils.js";
import cielab from "./cielab.js";

const THETA_DEG = 26,
	THETA = THETA_DEG * DEG2RAD,
	cosT = Math.cos(THETA),
	sinT = Math.sin(THETA);

const FACTOR = 0.83;

const C1 = 100 / Math.log(1.39),
	C2 = 0.0039,
	C3 = 0.075,
	C4 = 0.0435;

const A_MAX = 55,
	B_MAX = 55;

function xyzToLab(out, outObj, xyz) {
	outObj = cielab.to(xyz, outObj, true);

	out[0] = outObj.l * 100;
	out[1] = (outObj.a - 0.5) * 260;
	out[2] = (outObj.b - 0.5) * 260;

	return out;
}

function labToXyz(outObj, L, a, b, params) {
	return cielab.from(
		{
			l: L / 100,
			a: a / 260 + 0.5,
			b: b / 260 + 0.5,
		},
		outObj,
		params
	);
}

function labToDin99o(lab) {
	lab[0] = C1 * Math.log1p(C2 * lab[0]);

	if (Math.abs(lab[1]) < EPS_PRECISION && Math.abs(lab[2]) < EPS_PRECISION) {
		lab[1] = 0;
		lab[2] = 0;

		return lab;
	}

	const e = lab[1] * cosT + lab[2] * sinT,
		f = FACTOR * (lab[2] * cosT - lab[1] * sinT);

	const g = Math.hypot(e, f);

	const c99o = Math.log1p(C3 * g) / C4,
		h99o = Math.atan2(f, e) + THETA;

	lab[1] = c99o * Math.cos(h99o);
	lab[2] = c99o * Math.sin(h99o);

	return lab;
}

function din99oToLab(out, L99o, a99o, b99o) {
	out[0] = (Math.exp(L99o / C1) - 1) / C2;

	const c99o = Math.hypot(a99o, b99o);

	if (c99o < EPS_PRECISION) {
		out[1] = 0;
		out[2] = 0;

		return out;
	}

	const h99o = Math.atan2(b99o, a99o),
		g = (Math.exp(C4 * c99o) - 1) / C3;

	const e = g * Math.cos(h99o - THETA),
		f = g * Math.sin(h99o - THETA);

	out[1] = e * cosT - (f / FACTOR) * sinT;
	out[2] = e * sinT + (f / FACTOR) * cosT;

	return out;
}

const defaults = cielab.bake();

export default {
	name: "DIN99o",
	long: "DIN99o - Optimised DIN99 (Cui et al., 2002, 'o' variant)",
	css: "din99o",
	tags: ["perceptual_uniform"],
	base: "CIELAB",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L99o", primary: true },
		a: { from: -55, to: 55, step: 1, round: 0, name: "a99o" },
		b: { from: -55, to: 55, step: 1, round: 0, name: "b99o" },
	},

	options: cielab.options,
	bake: cielab.bake,

	from: (din, out = {}, params = defaults) => {
		const L99o = din.l * 100,
			a99o = (din.a - 0.5) * (2 * A_MAX),
			b99o = (din.b - 0.5) * (2 * B_MAX);

		const v3 = din99oToLab(alloc3(), L99o, a99o, b99o);

		out = labToXyz(out, v3[0], v3[1], v3[2], params);

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const v3 = xyzToLab(alloc3(), out, xyz, params);

		labToDin99o(v3);

		out.l = clamp(v3[0] / 100, 0, 1, unclamped);
		out.a = clamp(v3[1], -A_MAX, A_MAX, unclamped) / (2 * A_MAX) + 0.5;
		out.b = clamp(v3[2], -B_MAX, B_MAX, unclamped) / (2 * B_MAX) + 0.5;

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.5729, a: 0.8591, b: 0.7774 },
		"#00FF00": { l: 0.8937, a: 0.1561, b: 0.7917 },
		"#0000FF": { l: 0.3603, a: 0.7903, b: 0.1329 },
		"#FFFF00": { l: 0.9755, a: 0.4269, b: 0.9031 },
		"#00FFFF": { l: 0.9233, a: 0.1906, b: 0.3995 },
		"#FF00FF": { l: 0.6416, a: 0.9024, b: 0.297 },
		"#808080": { l: 0.5763, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.7785, a: 0.6495, b: 0.8665 },
	},
};
