import { resolveOptions } from "../options.js";
import { alloc3, free3 } from "../pool.js";
import { clamp, matmul, optimizeMatrix, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

const Xn_C = 98.074,
	Zn_C = 118.232;

const Ka_C = 175.0,
	Kb_C = 70.0;

function f(Y) {
	return (0.51 * (21 + 0.2 * Y)) / (1 + 0.21 * Y);
}

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer);
	const [toXYZ, fromXYZ] = preAdaptBradford(optimizeMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), wp, WHITEPOINT_D65);

	const Xn = wp[0] * 100,
		Zn = wp[2] * 100;

	const KA = Ka_C * Math.sqrt(Xn / Xn_C),
		KB = Kb_C * Math.sqrt(Zn / Zn_C);

	return {
		wp: wp,
		toXYZ: toXYZ,
		fromXYZ: fromXYZ,
		KA: KA,
		KB: KB,
	};
}

const defaults = makeParams();

export default {
	name: "Hunter Rd,a,b",
	long: "Hunter Color Space (Rd, a, b) - 1966",
	css: "hunter-rdab",
	tags: ["perceptual_uniform", "appearance_model"],
	base: "CIE 1931 XYZ",
	ui: {
		Rd: { from: 0, to: 100, step: 0.1, round: 2, name: "Luminance Rd", primary: true },
		a: { from: -100, to: 100, step: 0.1, round: 2, name: "a (Red-Green)" },
		b: { from: -100, to: 100, step: 0.1, round: 2, name: "b (Yellow-Blue)" },
	},

	options: options,
	bake: makeParams,

	from: (rdab, out = {}, params = defaults) => {
		const Rd = rdab.Rd * 100,
			a = rdab.a * 200 - 100,
			b = rdab.b * 200 - 100;

		const wp = params.wp;

		const Xn = wp[0] * 100,
			Yn = wp[1] * 100,
			Zn = wp[2] * 100;

		const Y_val = Rd,
			fY = f(Y_val);

		let X_val = 0,
			Z_val = 0;

		if (Math.abs(fY) > 1e-12) {
			X_val = Xn * (a / (params.KA * fY) + Y_val / Yn);
			Z_val = Zn * (Y_val / Yn - b / (params.KB * fY));
		}

		const xyz = matmul(alloc3(), params.toXYZ, X_val / 100, Y_val / 100, Z_val / 100);
		out.x = xyz[0];
		out.y = xyz[1];
		out.z = xyz[2];
		free3(xyz);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const wp = params.wp;

		const Xn = wp[0] * 100,
			Yn = wp[1] * 100,
			Zn = wp[2] * 100;

		const native = matmul(alloc3(), params.fromXYZ, xyz.x, xyz.y, xyz.z);
		const X_val = native[0] * 100,
			Y_val = native[1] * 100,
			Z_val = native[2] * 100;
		free3(native);

		const Rd = Y_val,
			fY = f(Y_val);

		const a = params.KA * fY * (X_val / Xn - Y_val / Yn),
			b = params.KB * fY * (Y_val / Yn - Z_val / Zn);

		out.Rd = clamp(Rd / 100, 0, 1, unclamped);
		out.a = clamp((a + 100) / 200, 0, 1, unclamped);
		out.b = clamp((b + 100) / 200, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { Rd: 0, a: 0.5, b: 0.5 },
		"#FFFFFF": { Rd: 1, a: 0.5003, b: 0.4998 },
		"#FF0000": { Rd: 0.2126, a: 0.9495, b: 0.6543 },
		"#00FF00": { Rd: 0.7152, a: 0.1719, b: 0.7287 },
		"#0000FF": { Rd: 0.0722, a: 0.9615, b: -0.7247 },
		"#FFFF00": { Rd: 0.9278, a: 0.4004, b: 0.7649 },
		"#00FFFF": { Rd: 0.7874, a: 0.2964, b: 0.4298 },
		"#FF00FF": { Rd: 0.2848, a: 1.0699, b: 0.1026 },
		"#808080": { Rd: 0.2159, a: 0.5001, b: 0.4999 },
		"#FFA500": { Rd: 0.4817, a: 0.6137, b: 0.6996 },
	},
};
