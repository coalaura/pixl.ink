import { resolveOptions } from "../options.js";
import { alloc3, free3 } from "../pool.js";
import { clamp, invert3x3, matmul, matmul3x3, optimizeMatrix, pow_sign, XYZ_TO_LMS_HPE_MATRIX } from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

const RLAB_LMS_TO_RLABREF_MATRIX = optimizeMatrix([
	[1.9569, -1.1882, 0.2313],
	[0.3612, 0.6388, 0.0],
	[0.0, 0.0, 1.0],
]);

const YN = 1000 / Math.PI,
	D = 1.0;

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
	surround: { type: "enum", allowed: ["average", "dim", "dark"], default: "average", name: "Surround" },
};

const SURROUND_VALS = {
	average: 2.3,
	dim: 2.9,
	dark: 3.5,
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer),
		sigma = SURROUND_VALS[opts.surround];

	const lms = matmul(alloc3(), XYZ_TO_LMS_HPE_MATRIX, wp[0], wp[1], wp[2]),
		sum = lms[0] + lms[1] + lms[2];

	const cbrtYN = Math.cbrt(YN);

	for (let i = 0; i < 3; i++) {
		const l = (3 * lms[i]) / sum,
			p = (1 + cbrtYN + l) / (1 + cbrtYN + 1 / l);

		lms[i] = (p + D * (1 - p)) / lms[i];
	}

	const AM = matmul3x3(
		optimizeMatrix([
			[lms[0], 0, 0],
			[0, lms[1], 0],
			[0, 0, lms[2]],
		]),
		XYZ_TO_LMS_HPE_MATRIX
	);

	free3(lms);

	const RAM = matmul3x3(RLAB_LMS_TO_RLABREF_MATRIX, AM),
		IRAM = invert3x3(RAM);

	return {
		RAM: RAM,
		IRAM: IRAM,
		sigma: sigma,
		sigmaInv: 1 / sigma,
	};
}

const defaults = makeParams();

export default {
	name: "RLAB",
	long: "RLAB (Fairchild 1996), variable whitepoint",
	css: "rlab",
	tags: ["appearance_model", "perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L", primary: true },
		a: { from: -125, to: 125, step: 1, round: 0, name: "a" },
		b: { from: -125, to: 125, step: 1, round: 0, name: "b" },
	},

	options: options,
	bake: makeParams,

	from: (rlab, out = {}, params = defaults) => {
		const IRAM = params.IRAM,
			sigma = params.sigma;

		const L_R = rlab.l * 100,
			a_R = (rlab.a - 0.5) * 250,
			b_R = (rlab.b - 0.5) * 250;

		const y_r = L_R * 0.01,
			x_r = pow_sign(a_R / 430 + y_r, sigma),
			z_r = pow_sign(y_r - b_R / 170, sigma);

		const y_comp = pow_sign(y_r, sigma);

		const v3 = matmul(alloc3(), IRAM, x_r, y_comp, z_r);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const RAM = params.RAM,
			sigmaInv = params.sigmaInv;

		const v3 = matmul(alloc3(), RAM, xyz.x, xyz.y, xyz.z);

		const x_r = pow_sign(v3[0], sigmaInv),
			y_r = pow_sign(v3[1], sigmaInv),
			z_r = pow_sign(v3[2], sigmaInv);

		free3(v3);

		const L_R = 100 * y_r,
			a_R = 430 * (x_r - y_r),
			b_R = 170 * (y_r - z_r);

		const l = L_R / 100,
			a = a_R / 250 + 0.5,
			b = b_R / 250 + 0.5;

		out.l = clamp(l, 0, 1, unclamped);
		out.a = clamp(a, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.5101, a: 0.819, b: 0.729 },
		"#00FF00": { l: 0.8644, a: 0.1378, b: 0.8279 },
		"#0000FF": { l: 0.3189, a: 0.7866, b: 0.0759 },
		"#FFFF00": { l: 0.9679, a: 0.4047, b: 0.8808 },
		"#00FFFF": { l: 0.9013, a: 0.2929, b: 0.4381 },
		"#FF00FF": { l: 0.5793, a: 0.9046, b: 0.2473 },
		"#808080": { l: 0.5135, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.7279, a: 0.6006, b: 0.7964 },
	},
};
