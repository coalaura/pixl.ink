import { allocObj, freeObj } from "../pool.js";
import { CAM02_LCD_C1, CAM02_LCD_C2, clamp, DEG2RAD, EPS_PRECISION, normalizeAngle360, RAD2DEG } from "../utils.js";
import cam02 from "./cam02.js";

function jPrimeFromJ(J) {
	return ((1 + 100 * CAM02_LCD_C1) * J) / (1 + CAM02_LCD_C1 * J);
}

function jFromJPrime(Jp) {
	return Jp / (1 + CAM02_LCD_C1 * (100 - Jp));
}

function mPrimeFromM(M) {
	return Math.log(1 + CAM02_LCD_C2 * M) / CAM02_LCD_C2;
}

function mFromMPrime(Mp) {
	return (Math.exp(CAM02_LCD_C2 * Mp) - 1) / CAM02_LCD_C2;
}

const defaults = cam02.bake();

export default {
	name: "CAM02-LCD",
	long: "CAM02 Large Colour Differences (CAM02-LCD)",
	css: "cam02-lcd",
	tags: ["perceptual_uniform"],
	base: "CAM02",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		a: { from: -55, to: 55, step: 1, round: 0, name: "a" },
		b: { from: -55, to: 55, step: 1, round: 0, name: "b" },
	},

	options: cam02.options,
	bake: cam02.bake,

	from: (lcd, out = {}, params = defaults) => {
		const Jp = lcd.j * 100,
			ap = (lcd.a - 0.5) * 110,
			bp = (lcd.b - 0.5) * 110;

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
		out.a = clamp(ap / 110 + 0.5, 0, 1, unclamped);
		out.b = clamp(bp / 110 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { j: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { j: 1.0, a: 0.4823, b: 0.4895 },
		"#FF0000": { j: 0.6005, a: 1.0158, b: 0.8243 },
		"#00FF00": { j: 0.8701, a: 0.0748, b: 0.9014 },
		"#0000FF": { j: 0.3122, a: 0.3931, b: 0.0006 },
		"#FFFF00": { j: 0.9741, a: 0.3716, b: 0.9434 },
		"#00FFFF": { j: 0.9026, a: 0.1663, b: 0.3915 },
		"#FF00FF": { j: 0.6668, a: 0.9727, b: 0.2264 },
		"#808080": { j: 0.5623, a: 0.4884, b: 0.4931 },
		"#FFA500": { j: 0.7904, a: 0.6192, b: 0.8748 },
	},
};
