import { resolveOptions } from "../options.js";
import { alloc2, free2 } from "../pool.js";
import { clamp, EPS_PRECISION } from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

function uv1960FromXYZ(out, x, y, z) {
	const denom = x + 15 * y + 3 * z;

	if (Math.abs(denom) < EPS_PRECISION) {
		out[0] = 0;
		out[1] = 0;

		return out;
	}

	out[0] = (4 * x) / denom;
	out[1] = (6 * y) / denom;

	return out;
}

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer);

	return {
		wp: wp,
	};
}

const defaults = makeParams();

export default {
	name: "CIE 1964 UVW",
	long: "CIE 1964 Uniform Color Space (UVW)",
	css: "uvw",
	unbounded: true,
	tags: ["perceptual_uniform"],
	base: "CIE 1960 UCS",
	ui: {
		u: { from: -200, to: 200, step: 1, round: 0, name: "U*" },
		v: { from: -200, to: 200, step: 1, round: 0, name: "V*" },
		w: { from: 0, to: 100, step: 1, round: 0, name: "W*", primary: true },
	},

	options: options,
	bake: makeParams,

	from: (uvw, out = {}, params = defaults) => {
		const U = (uvw.u - 0.5) * 400,
			V = (uvw.v - 0.5) * 400,
			W = uvw.w * 100;

		const wp = params.wp,
			uv = uv1960FromXYZ(alloc2(), wp[0], wp[1], wp[2]);

		let u = uv[0],
			v = uv[1];

		if (Math.abs(W) > EPS_PRECISION) {
			u = U / (13 * W) + uv[0];
			v = V / (13 * W) + uv[1];
		}

		free2(uv);

		if (Math.abs(v) < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const Y100 = Math.max((W + 17) / 25, 0) ** 3;

		out.y = Y100 / 100;

		const D = (6 * out.y) / v;

		out.x = (u / 4) * D;
		out.z = (D - out.x - 15 * out.y) / 3;

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const wp = params.wp;

		const uvW = uv1960FromXYZ(alloc2(), wp[0], wp[1], wp[2]),
			uv = uv1960FromXYZ(alloc2(), xyz.x, xyz.y, xyz.z);

		const Y100 = xyz.y * 100,
			W = 25 * Math.cbrt(Math.max(Y100, 0)) - 17;

		const uEff = uv[0] === 0 && uv[1] === 0 ? uvW[0] : uv[0],
			vEff = uv[0] === 0 && uv[1] === 0 ? uvW[1] : uv[1];

		const U = 13 * W * (uEff - uvW[0]),
			V = 13 * W * (vEff - uvW[1]);

		free2(uvW);
		free2(uv);

		out.u = clamp(U / 400 + 0.5, 0, 1, unclamped);
		out.v = clamp(V / 400 + 0.5, 0, 1, unclamped);
		out.w = clamp(W / 100, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { u: 0.5, v: 0.5, w: -0.17 },
		"#FFFFFF": { u: 0.4999, v: 0.5, w: 0.9903 },
		"#FF0000": { u: 0.9295, v: 0.5617, w: 0.5226 },
		"#00FF00": { u: 0.2946, v: 0.677, w: 0.8677 },
		"#0000FF": { u: 0.4772, v: 0.2893, w: 0.3131 },
		"#FFFF00": { u: 0.519, v: 0.6762, w: 0.9617 },
		"#00FFFF": { u: 0.3257, v: 0.4749, w: 0.9015 },
		"#FF00FF": { u: 0.7067, v: 0.3217, w: 0.5934 },
		"#808080": { u: 0.4999, v: 0.4999, w: 0.526 },
		"#FFA500": { u: 0.6846, v: 0.6217, w: 0.7396 },
	},
};
