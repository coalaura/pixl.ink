import { resolveOptions } from "../options.js";
import { alloc2, alloc3, free2, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, LAB_EPSILON, LAB_KAPPA, matmul, matmul3x3, optimizeMatrix, preAdaptBradford, WHITEPOINT_D65, XYZ_TO_LINEAR_RGB_MATRIX } from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

function uvp1976FromXYZ(out, x, y, z) {
	const denom = x + 15 * y + 3 * z;

	if (Math.abs(denom) < EPS_PRECISION) {
		out[0] = 0;
		out[1] = 0;
		return out;
	}

	out[0] = (4 * x) / denom;
	out[1] = (9 * y) / denom;

	return out;
}

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer);
	const [toXYZ, fromXYZ] = preAdaptBradford(optimizeMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), wp, WHITEPOINT_D65);

	return {
		wp: wp,
		toXYZ: toXYZ,
		fromXYZ: fromXYZ,
		toRGB: matmul3x3(XYZ_TO_LINEAR_RGB_MATRIX, toXYZ),
	};
}

const defaults = makeParams();

export default {
	name: "CIELUV",
	long: "CIE 1976 L*u*v* (CIELUV)",
	css: "luv",
	tags: ["perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L", primary: true },
		u: { from: -215, to: 215, step: 1, round: 0, name: "u" },
		v: { from: -215, to: 215, step: 1, round: 0, name: "v" },
	},

	options: options,
	bake: makeParams,

	from: (luv, out = {}, params = defaults) => {
		const L = luv.l * 100,
			uStar = (luv.u - 0.5) * 430,
			vStar = (luv.v - 0.5) * 430;

		if (L === 0) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const wp = params.wp,
			upv = uvp1976FromXYZ(alloc2(), wp[0], wp[1], wp[2]);

		const up = uStar / (13 * L) + upv[0],
			vp = vStar / (13 * L) + upv[1];

		free2(upv);

		if (Math.abs(vp) < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		out.y = L <= 8 ? L / LAB_KAPPA : ((L + 16) / 116) ** 3;
		out.x = out.y * ((9 * up) / (4 * vp));
		out.z = out.y * ((12 - 3 * up - 20 * vp) / (4 * vp));
		const xyz = matmul(alloc3(), params.toXYZ, out.x, out.y, out.z);
		out.x = xyz[0];
		out.y = xyz[1];
		out.z = xyz[2];
		free3(xyz);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const native = matmul(alloc3(), params.fromXYZ, xyz.x, xyz.y, xyz.z);
		const X = native[0],
			Y = native[1],
			Z = native[2];
		free3(native);

		const uvp = uvp1976FromXYZ(alloc2(), X, Y, Z),
			L = Y <= LAB_EPSILON ? LAB_KAPPA * Y : 116 * Math.cbrt(Y) - 16;

		if (Math.abs(L) < EPS_PRECISION || !Number.isFinite(uvp[0]) || !Number.isFinite(uvp[1])) {
			free2(uvp);

			out.l = 0;
			out.u = 0.5;
			out.v = 0.5;

			return out;
		}

		const wp = params.wp,
			uvpW = uvp1976FromXYZ(alloc2(), wp[0], wp[1], wp[2]);

		const uStar = 13 * L * (uvp[0] - uvpW[0]),
			vStar = 13 * L * (uvp[1] - uvpW[1]);

		free2(uvpW);
		free2(uvp);

		out.l = clamp(L / 100, 0, 1, unclamped);
		out.u = clamp(uStar / 430 + 0.5, 0, 1, unclamped);
		out.v = clamp(vStar / 430 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { l: 0, u: 0.5, v: 0.5 },
		"#FFFFFF": { l: 1, u: 0.5, v: 0.5 },
		"#FF0000": { l: 0.5324, u: 0.907, v: 0.5878 },
		"#00FF00": { l: 0.8774, u: 0.3068, v: 0.7498 },
		"#0000FF": { l: 0.323, u: 0.4781, v: 0.1969 },
		"#FFFF00": { l: 0.9714, u: 0.5179, v: 0.7484 },
		"#00FFFF": { l: 0.9111, u: 0.3361, v: 0.4646 },
		"#FF00FF": { l: 0.6032, u: 0.6955, v: 0.2472 },
		"#808080": { l: 0.5359, u: 0.5, v: 0.5 },
		"#FFA500": { l: 0.7493, u: 0.674, v: 0.6721 },
	},
};
