import { allocObj, freeObj } from "../pool.js";
import { CAM_UCS_C1, CAM_UCS_C2, clamp, DEG2RAD, EPS_PRECISION, normalizeAngle360, RAD2DEG } from "../utils.js";
import cam16 from "./cam16.js";

function jPrimeFromJ(J) {
	return ((1 + 100 * CAM_UCS_C1) * J) / (1 + CAM_UCS_C1 * J);
}

function jFromJPrime(Jp) {
	return Jp / (1 + CAM_UCS_C1 * (100 - Jp));
}

function mPrimeFromM(M) {
	return Math.log(1 + CAM_UCS_C2 * M) / CAM_UCS_C2;
}

function mFromMPrime(Mp) {
	return (Math.exp(CAM_UCS_C2 * Mp) - 1) / CAM_UCS_C2;
}

const defaults = cam16.bake();

export default {
	name: "CAM16-UCS",
	long: "CAM16 Uniform Color Space (CAM16-UCS)",
	css: "cam16-ucs",
	tags: ["perceptual_uniform"],
	base: "CAM16",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		a: { from: -50, to: 50, step: 1, round: 0, name: "a" },
		b: { from: -50, to: 50, step: 1, round: 0, name: "b" },
	},

	options: cam16.options,
	bake: cam16.bake,

	from: (ucs, out = {}, params = defaults) => {
		const Jp = ucs.j * 100,
			ap = (ucs.a - 0.5) * 100,
			bp = (ucs.b - 0.5) * 100;

		const Mp = Math.hypot(ap, bp);

		let hDeg = 0;

		if (Mp > EPS_PRECISION) {
			hDeg = normalizeAngle360(Math.atan2(bp, ap) * RAD2DEG);
		}

		const J = jFromJPrime(Jp),
			M = mFromMPrime(Mp);

		return cam16.from(
			{
				j: J / 100,
				m: M / 105,
				h: hDeg / 360,
			},
			out,
			params
		);
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const jmh = cam16.to(xyz, allocObj(), true, params);

		const J = jmh.j * 100,
			M = jmh.m * 105,
			hDeg = jmh.h * 360;

		freeObj(jmh);

		const Jp = jPrimeFromJ(J),
			Mp = mPrimeFromM(M);

		const hRad = hDeg * DEG2RAD,
			ap = Mp * Math.cos(hRad),
			bp = Mp * Math.sin(hRad);

		const jOut = clamp(Jp / 100, 0, 1, unclamped),
			aOut = clamp(ap / 100 + 0.5, 0, 1, unclamped),
			bOut = clamp(bp / 100 + 0.5, 0, 1, unclamped);

		out.j = jOut;
		out.a = aOut;
		out.b = bOut;

		return out;
	},

	expected: {
		"#000000": { j: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { j: 1.0, a: 0.481, b: 0.4892 },
		"#FF0000": { j: 0.5918, a: 0.9082, b: 0.7115 },
		"#00FF00": { j: 0.8655, a: 0.1451, b: 0.775 },
		"#0000FF": { j: 0.3625, a: 0.5857, b: 0.1213 },
		"#FFFF00": { j: 0.968, a: 0.3722, b: 0.8304 },
		"#00FFFF": { j: 0.9064, a: 0.2145, b: 0.4149 },
		"#FF00FF": { j: 0.6739, a: 0.9021, b: 0.3088 },
		"#808080": { j: 0.5623, a: 0.4874, b: 0.4929 },
		"#FFA500": { j: 0.7836, a: 0.5969, b: 0.7863 },
	},
};
