import { allocObj, freeObj } from "../pool.js";
import { CAM_UCS_C1, CAM_UCS_C2, CAM_UCS_K, clamp, DEG2RAD, EPS_PRECISION, normalizeAngle360, RAD2DEG } from "../utils.js";
import cam02 from "./cam02.js";

function J_to_Jp(J) {
	return (CAM_UCS_K * J) / (1 + CAM_UCS_C1 * J);
}

function M_to_Mp(M) {
	return Math.log(1 + CAM_UCS_C2 * M) / CAM_UCS_C2;
}

function Jp_to_J(Jp) {
	return Jp / (CAM_UCS_K - CAM_UCS_C1 * Jp);
}

function Mp_to_M(Mp) {
	return (Math.exp(CAM_UCS_C2 * Mp) - 1) / CAM_UCS_C2;
}

const defaults = cam02.bake();

export default {
	name: "CAM02-UCS",
	long: "CIECAM02 Uniform Color Space (CAM02-UCS), J'a'b'",
	css: "cam02-ucs",
	tags: ["perceptual_uniform"],
	base: "CAM02",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		a: { from: -50, to: 50, step: 1, round: 0, name: "a" },
		b: { from: -50, to: 50, step: 1, round: 0, name: "b" },
	},

	options: cam02.options,
	bake: cam02.bake,

	from: (jab, out = {}, params = defaults) => {
		const Jp = jab.j * 100,
			ap = (jab.a - 0.5) * 100,
			bp = (jab.b - 0.5) * 100;

		const Mp = Math.sqrt(ap * ap + bp * bp);

		if (Jp < EPS_PRECISION && Mp < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;
			return out;
		}

		const h = normalizeAngle360(Math.atan2(bp, ap) * RAD2DEG);

		const J = Jp_to_J(Jp),
			M = Mp_to_M(Mp);

		return cam02.from(
			{
				j: J / 100,
				m: M / 120,
				h: h / 360,
			},
			out,
			params
		);
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const jmh = cam02.to(xyz, allocObj(), true, params);

		const J = jmh.j * 100,
			M = jmh.m * 120,
			hDeg = jmh.h * 360;

		freeObj(jmh);

		const Jp = J_to_Jp(J),
			Mp = M_to_Mp(M);

		const ach = Mp < EPS_PRECISION;

		const aPrime = ach ? 0 : Mp * Math.cos(hDeg * DEG2RAD),
			bPrime = ach ? 0 : Mp * Math.sin(hDeg * DEG2RAD);

		out.j = clamp(Jp / 100, 0, 1, unclamped);
		out.a = clamp(aPrime / 100 + 0.5, 0, 1, unclamped);
		out.b = clamp(bPrime / 100 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { j: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { j: 1.0, a: 0.4808, b: 0.4886 },
		"#FF0000": { j: 0.6005, a: 0.8868, b: 0.7432 },
		"#00FF00": { j: 0.87, a: 0.1777, b: 0.8043 },
		"#0000FF": { j: 0.3122, a: 0.4161, b: 0.1084 },
		"#FFFF00": { j: 0.9741, a: 0.3969, b: 0.8561 },
		"#00FFFF": { j: 0.9026, a: 0.2158, b: 0.4076 },
		"#FF00FF": { j: 0.6668, a: 0.8645, b: 0.2889 },
		"#808080": { j: 0.5623, a: 0.4873, b: 0.4925 },
		"#FFA500": { j: 0.7904, a: 0.5992, b: 0.8118 },
	},
};
