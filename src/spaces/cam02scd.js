import { allocObj, freeObj } from "../pool.js";
import { CAM02_SCD_C1, CAM02_SCD_C2, clamp, DEG2RAD, EPS_PRECISION, normalizeAngle360, RAD2DEG } from "../utils.js";
import cam02 from "./cam02.js";

function jPrimeFromJ(J) {
	return ((1 + 100 * CAM02_SCD_C1) * J) / (1 + CAM02_SCD_C1 * J);
}

function jFromJPrime(Jp) {
	return Jp / (1 + CAM02_SCD_C1 * (100 - Jp));
}

function mPrimeFromM(M) {
	return Math.log(1 + CAM02_SCD_C2 * M) / CAM02_SCD_C2;
}

function mFromMPrime(Mp) {
	return (Math.exp(CAM02_SCD_C2 * Mp) - 1) / CAM02_SCD_C2;
}

const defaults = cam02.bake();

export default {
	name: "CAM02-SCD",
	long: "CAM02 Small Colour Differences (CAM02-SCD)",
	css: "cam02-scd",
	tags: ["perceptual_uniform"],
	base: "CAM02",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		a: { from: -30, to: 30, step: 1, round: 0, name: "a" },
		b: { from: -30, to: 30, step: 1, round: 0, name: "b" },
	},

	options: cam02.options,
	bake: cam02.bake,

	from: (scd, out = {}, params = defaults) => {
		const Jp = scd.j * 100,
			ap = (scd.a - 0.5) * 60,
			bp = (scd.b - 0.5) * 60;

		const Mp = Math.hypot(ap, bp);

		let hDeg = 0;

		if (Mp > EPS_PRECISION) {
			hDeg = normalizeAngle360(Math.atan2(bp, ap) * RAD2DEG);
		}

		const J = jFromJPrime(Jp),
			M = mFromMPrime(Mp);

		const jmh = allocObj();

		jmh.j = J / 100;
		jmh.m = M / 120;
		jmh.h = hDeg / 360;

		cam02.from(jmh, out, params);

		freeObj(jmh);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const jmh = cam02.to(xyz, allocObj(), true, params);

		const J = jmh.j * 100,
			M = jmh.m * 120,
			hDeg = jmh.h * 360;

		freeObj(jmh);

		const Jp = jPrimeFromJ(J),
			Mp = mPrimeFromM(M);

		const hRad = hDeg * DEG2RAD,
			ap = Mp * Math.cos(hRad),
			bp = Mp * Math.sin(hRad);

		out.j = clamp(Jp / 100, 0, 1, unclamped);
		out.a = clamp(ap / 60 + 0.5, 0, 1, unclamped);
		out.b = clamp(bp / 60 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { j: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { j: 1.0, a: 0.4686, b: 0.4813 },
		"#FF0000": { j: 0.6005, a: 1.0311, b: 0.8339 },
		"#00FF00": { j: 0.8701, a: 0.0559, b: 0.9193 },
		"#0000FF": { j: 0.3122, a: 0.3831, b: -0.0461 },
		"#FFFF00": { j: 0.9741, a: 0.3549, b: 1.0011 },
		"#00FFFF": { j: 0.9026, a: 0.0904, b: 0.3669 },
		"#FF00FF": { j: 0.6668, a: 1.0055, b: 0.2074 },
		"#808080": { j: 0.5623, a: 0.4792, b: 0.4876 },
		"#FFA500": { j: 0.7904, a: 0.6416, b: 0.945 },
	},
};
