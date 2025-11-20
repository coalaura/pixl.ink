import { resolveOptions } from "../options.js";
import { clamp, EPS_PRECISION } from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

const CXN = 98.04,
	CZN = 118.11,
	CKA = 175.0,
	CKB = 70.0;

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer);

	const KA = CKA * Math.sqrt((wp[0] * 100) / CXN),
		KB = CKB * Math.sqrt((wp[2] * 100) / CZN);

	return {
		wp: wp,
		KA: KA,
		KB: KB,
	};
}

const defaults = makeParams();

export default {
	name: "Hunter Lab",
	long: "Hunter L,a,b (Hunter 1966) Reflectance Space",
	css: "hunter-lab",
	tags: ["perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L", primary: true },
		a: { from: -210, to: 210, step: 1, round: 0, name: "a" },
		b: { from: -210, to: 210, step: 1, round: 0, name: "b" },
	},

	options: options,
	bake: makeParams,

	from: (lab, out = {}, params = defaults) => {
		const l_frac = lab.l;

		if (l_frac < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const a_val = (lab.a - 0.5) * 420,
			b_val = (lab.b - 0.5) * 420;

		const wp = params.wp,
			KA = params.KA,
			KB = params.KB;

		const y_prime = l_frac * l_frac,
			x_prime = (a_val * l_frac) / KA + y_prime,
			z_prime = y_prime - (b_val * l_frac) / KB;

		out.x = x_prime * wp[0];
		out.y = y_prime * wp[1];
		out.z = z_prime * wp[2];

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const wp = params.wp,
			y_prime = xyz.y / wp[1];

		if (y_prime < EPS_PRECISION) {
			out.l = 0;
			out.a = 0.5;
			out.b = 0.5;

			return out;
		}

		const l_frac = Math.sqrt(y_prime),
			x_prime = xyz.x / wp[0],
			z_prime = xyz.z / wp[2];

		const KA = params.KA,
			KB = params.KB;

		const a_val = (KA * (x_prime - y_prime)) / l_frac,
			b_val = (KB * (y_prime - z_prime)) / l_frac;

		out.l = clamp(l_frac, 0, 1, unclamped);
		out.a = clamp(a_val / 420 + 0.5, 0, 1, unclamped);
		out.b = clamp(b_val / 420 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.4611, a: 0.6968, b: 0.5676 },
		"#00FF00": { l: 0.8457, a: 0.3356, b: 0.6146 },
		"#0000FF": { l: 0.2687, a: 0.6797, b: 0.0231 },
		"#FFFF00": { l: 0.9632, a: 0.4499, b: 0.633 },
		"#00FFFF": { l: 0.8873, a: 0.3977, b: 0.4648 },
		"#FF00FF": { l: 0.5337, a: 0.7605, b: 0.3184 },
		"#808080": { l: 0.4646, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.6941, a: 0.5554, b: 0.5975 },
	},
};
