import { alloc3, free3 } from "../pool.js";
import { clamp, DEG2RAD, EPS_PRECISION } from "../utils.js";
import cielab from "./cielab.js";

const THETA_DEG = 16,
	THETA = THETA_DEG * DEG2RAD,
	cosT = Math.cos(THETA),
	sinT = Math.sin(THETA);

const L99_C1 = 105.509,
	L99_C2 = 0.0158;

const F_SCALE = 0.7,
	C99_K = 0.045;

const A99_MAX = 50,
	B99_MAX = 50;

function xyzToLab(out, outObj, xyz, params) {
	outObj = cielab.to(xyz, outObj, true, params);

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

function labToDin99(lab) {
	lab[0] = L99_C1 * Math.log1p(L99_C2 * lab[0]);

	const e = lab[1] * cosT + lab[2] * sinT,
		f = F_SCALE * (-lab[1] * sinT + lab[2] * cosT);

	const G = Math.hypot(e, f);

	if (G < EPS_PRECISION) {
		lab[1] = 0;
		lab[2] = 0;

		return lab;
	}

	const C99 = Math.log1p(C99_K * G) / C99_K;

	lab[1] = (C99 * e) / G;
	lab[2] = (C99 * f) / G;

	return lab;
}

function din99ToLab(out, L99, a99, b99) {
	out[0] = (Math.exp(L99 / L99_C1) - 1) / L99_C2;

	const C99 = Math.hypot(a99, b99);

	if (C99 < EPS_PRECISION) {
		out[1] = 0;
		out[2] = 0;

		return out;
	}

	const G = (Math.exp(C99_K * C99) - 1) / C99_K;

	const e = (a99 * G) / C99,
		f = (b99 * G) / C99;

	const u = e,
		v = f / F_SCALE;

	out[1] = u * cosT - v * sinT;
	out[2] = u * sinT + v * cosT;

	return out;
}

const defaults = cielab.bake();

export default {
	name: "DIN99",
	long: "DIN99 (Original 1999) - Uniform Color Space based on DIN99 ΔE",
	css: "din99",
	tags: ["perceptual_uniform"],
	base: "CIELAB",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L99", primary: true },
		a: { from: -50, to: 50, step: 1, round: 0, name: "a99" },
		b: { from: -50, to: 50, step: 1, round: 0, name: "b99" },
	},

	options: cielab.options,
	bake: cielab.bake,

	from: (din, out = {}, params = defaults) => {
		const L99 = din.l * 100,
			a99 = (din.a - 0.5) * (2 * A99_MAX),
			b99 = (din.b - 0.5) * (2 * B99_MAX);

		const v3 = din99ToLab(alloc3(), L99, a99, b99);

		out = labToXyz(out, v3[0], v3[1], v3[2], params);

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const v3 = xyzToLab(alloc3(), out, xyz, params);

		labToDin99(v3);

		out.l = clamp(v3[0] / 100, 0, 1, unclamped);
		out.a = clamp(v3[1], -A99_MAX, A99_MAX, unclamped) / (2 * A99_MAX) + 0.5;
		out.b = clamp(v3[2], -B99_MAX, B99_MAX, unclamped) / (2 * B99_MAX) + 0.5;

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5001, b: 0.5 },
		"#FF0000": { l: 0.644, a: 0.8618, b: 0.6128 },
		"#00FF00": { l: 0.9176, a: 0.2658, b: 0.7838 },
		"#0000FF": { l: 0.4351, a: 0.6764, b: 0.1661 },
		"#FFFF00": { l: 0.9813, a: 0.5244, b: 0.8103 },
		"#00FFFF": { l: 0.941, a: 0.2377, b: 0.4988 },
		"#FF00FF": { l: 0.7063, a: 0.7972, b: 0.2708 },
		"#808080": { l: 0.6472, a: 0.5001, b: 0.5 },
		"#FFA500": { l: 0.8242, a: 0.7078, b: 0.7252 },
	},
};
