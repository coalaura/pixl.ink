import { resolveOptions } from "../options.js";
import { alloc3, free3 } from "../pool.js";
import {
	CAT16_INV_MATRIX,
	CAT16_MATRIX,
	camAdapt,
	camUnadapt,
	clamp,
	DEG2RAD,
	EPS_PRECISION,
	M1_MATRIX,
	matmul,
	normalizeAngle360,
	normalizeAngleRad,
	RAD2DEG,
	spow,
	zdiv,
} from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

const SURROUND_PRESETS = {
	average: { F: 1.0, C: 0.69, NC: 1.0 },
	dim: { F: 0.9, C: 0.59, NC: 0.9 },
	dark: { F: 0.8, C: 0.525, NC: 0.8 },
};

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
	adaptingLuminance: { type: "number", min: 0, max: 10000, default: (64 / Math.PI) * 0.2, name: "Adapting Luminance (La)" },
	backgroundLuminance: { type: "number", min: 0, max: 1000, default: 20, name: "Background Luminance (Yb)" },
	surround: { type: "enum", allowed: ["average", "dim", "dark"], default: "average", name: "Surround" },
	discounting: { type: "boolean", default: false, name: "Discounting" },
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer),
		La = opts.adaptingLuminance,
		Yb = opts.backgroundLuminance,
		surround = SURROUND_PRESETS[opts.surround];

	const F = surround.F,
		C = surround.C,
		NC = surround.NC;

	const k = 1 / (5 * La + 1),
		k4 = k * k * k * k;

	const fl = 0.2 * k4 * (5 * La) + 0.1 * (1 - k4) * (1 - k4) * Math.cbrt(5 * La),
		flRoot = Math.pow(fl, 0.25);

	const n = Yb / (wp[1] * 100),
		z = 1.48 + Math.sqrt(n);

	const nbb = 0.725 * Math.pow(n, -0.2),
		ncb = nbb;

	let d = F * (1 - (1 / 3.6) * Math.exp((-La - 42) / 92));

	d = opts.discounting ? 1.0 : clamp(d, 0, 1);

	const wpX = wp[0] * 100,
		wpY = wp[1] * 100,
		wpZ = wp[2] * 100;

	const rgbW = matmul(alloc3(), CAT16_MATRIX, wpX, wpY, wpZ);

	const dR = 1 + d * (wpY / rgbW[0] - 1),
		dG = 1 + d * (wpY / rgbW[1] - 1),
		dB = 1 + d * (wpY / rgbW[2] - 1);

	const D_RGB = new Float64Array([dR, dG, dB]),
		D_RGB_INV = new Float64Array([1 / dR, 1 / dG, 1 / dB]);

	const rgbCW = alloc3();

	rgbCW[0] = rgbW[0] * dR;
	rgbCW[1] = rgbW[1] * dG;
	rgbCW[2] = rgbW[2] * dB;

	const rgbAW = camAdapt(alloc3(), rgbCW[0], rgbCW[1], rgbCW[2], fl),
		Aw = nbb * (2 * rgbAW[0] + rgbAW[1] + 0.05 * rgbAW[2]);

	free3(rgbW);
	free3(rgbCW);
	free3(rgbAW);

	return {
		C: C,
		NC: NC,
		FL: fl,
		FL_ROOT: flRoot,
		N: n,
		Z: z,
		NBB: nbb,
		NCB: ncb,
		D_RGB: D_RGB,
		D_RGB_INV: D_RGB_INV,
		A_W: Aw,
	};
}

const defaults = makeParams();

export default {
	name: "CAM16 JMh",
	long: "CAM16 (Color Appearance Model 2016), J-M-h",
	css: "cam16-jmh",
	tags: ["appearance_model"],
	base: "CIE 1931 XYZ",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		m: { from: 0, to: 105, step: 1, round: 0, name: "Colorfulness M" },
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	options: options,
	bake: makeParams,

	from: (jmh, out = {}, params = defaults) => {
		const J = jmh.j * 100,
			M = jmh.m * 105,
			h = jmh.h * 360;

		if (J < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const A_W = params.A_W,
			D_INV = params.D_RGB_INV,
			FL = params.FL,
			FL_ROOT = params.FL_ROOT; // Ensure FL_ROOT is used

		const hRad = normalizeAngle360(h) * DEG2RAD,
			cosh = Math.cos(hRad),
			sinh = Math.sin(hRad);

		const Jroot = spow(J, 0.5) * 0.1;

		if (M < EPS_PRECISION || Jroot < EPS_PRECISION) {
			const A = A_W * spow(Jroot, 2 / params.C / params.Z),
				p2Term = A / params.NBB;

			const v3 = matmul(alloc3(), M1_MATRIX, p2Term, 0, 0);

			camUnadapt(v3, v3[0] / 1403, v3[1] / 1403, v3[2] / 1403, FL);
			matmul(v3, CAT16_INV_MATRIX, v3[0] * D_INV[0], v3[1] * D_INV[1], v3[2] * D_INV[2]);

			out.x = v3[0] / 100;
			out.y = v3[1] / 100;
			out.z = v3[2] / 100;

			free3(v3);

			return out;
		}

		const alpha = M / FL_ROOT / Jroot,
			alphaClamp = Math.min(alpha, 1000),
			t = spow(alphaClamp * (1.64 - 0.29 ** params.N) ** -0.73, 10 / 9);

		const et = 0.25 * (Math.cos(hRad + 2) + 3.8),
			A = A_W * spow(Jroot, 2 / params.C / params.Z);

		const p1Term = (5e4 / 13) * params.NC * params.NCB * et,
			p2Term = A / params.NBB,
			denominator = 23 * p1Term + t * (11 * cosh + 108 * sinh);

		if (Math.abs(denominator) < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const r = 23 * (p2Term + 0.305) * (t / denominator),
			a = r * cosh,
			b = r * sinh;

		const v3b = matmul(alloc3(), M1_MATRIX, p2Term, a, b);

		camUnadapt(v3b, v3b[0] / 1403, v3b[1] / 1403, v3b[2] / 1403, FL);

		matmul(v3b, CAT16_INV_MATRIX, v3b[0] * D_INV[0], v3b[1] * D_INV[1], v3b[2] * D_INV[2]);

		out.x = v3b[0] / 100;
		out.y = v3b[1] / 100;
		out.z = v3b[2] / 100;

		free3(v3b);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		if (xyz.x < EPS_PRECISION && xyz.y < EPS_PRECISION && xyz.z < EPS_PRECISION) {
			out.j = 0;
			out.m = 0;
			out.h = 0;

			return out;
		}

		const D = params.D_RGB,
			A_W = params.A_W,
			FL = params.FL;

		const v3 = matmul(alloc3(), CAT16_MATRIX, xyz.x * 100, xyz.y * 100, xyz.z * 100);

		camAdapt(v3, v3[0] * D[0], v3[1] * D[1], v3[2] * D[2], FL);

		const a = v3[0] + (-12 * v3[1] + v3[2]) / 11,
			b = (v3[0] + v3[1] - 2 * v3[2]) / 9,
			hRad = normalizeAngleRad(Math.atan2(b, a));

		const et = 0.25 * (Math.cos(hRad + 2) + 3.8);

		const chromaSum = v3[0] + v3[1] + 1.05 * v3[2] + 0.305,
			t = (5e4 / 13) * params.NC * params.NCB * zdiv(et * Math.sqrt(a * a + b * b), chromaSum);

		const alpha = spow(t, 0.9) * (1.64 - 0.29 ** params.N) ** 0.73,
			A = params.NBB * (2 * v3[0] + v3[1] + 0.05 * v3[2]);

		free3(v3);

		if (A < EPS_PRECISION) {
			out.j = 0;
			out.m = 0;
			out.h = 0;

			return out;
		}

		const Jroot = spow(A / A_W, 0.5 * params.C * params.Z),
			J = 100 * spow(Jroot, 2),
			M = alpha * Jroot * params.FL_ROOT,
			h = hRad * RAD2DEG;

		const isAchromatic = Math.abs(M) < EPS_PRECISION;

		out.j = clamp(J / 100, 0, 1, unclamped);
		out.m = clamp(isAchromatic ? 0 : M / 105, 0, 1, unclamped);
		out.h = clamp(isAchromatic ? 0 : h / 360, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { j: 0.0, m: 0.0, h: 0.0 },
		"#FFFFFF": { j: 1.0, m: 0.0213, h: 0.582 },
		"#FF0000": { j: 0.4603, m: 0.7738, h: 0.0761 },
		"#00FF00": { j: 0.791, m: 0.7449, h: 0.3951 },
		"#0000FF": { j: 0.2507, m: 0.5947, h: 0.7854 },
		"#FFFF00": { j: 0.9468, m: 0.519, h: 0.3087 },
		"#00FFFF": { j: 0.8506, m: 0.4062, h: 0.5461 },
		"#FF00FF": { j: 0.5486, m: 0.7352, h: 0.9294 },
		"#808080": { j: 0.4304, m: 0.014, h: 0.582 },
		"#FFA500": { j: 0.6806, m: 0.4144, h: 0.198 },
	},
};
