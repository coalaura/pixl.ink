import { alloc3, allocObj, free3, freeObj } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, xyzToSrgb } from "../utils.js";

function lccToOrgB(outObj, C1, C2) {
	const c = Math.hypot(C1, C2);

	if (c < EPS_PRECISION) {
		outObj.cyb = 0.0;
		outObj.crg = 0.0;

		return outObj;
	}

	const sign = C2 >= 0 ? 1 : -1,
		theta = Math.atan2(Math.abs(C2), C1);

	let theta_o;

	if (theta < Math.PI / 3) {
		theta_o = 1.5 * theta;
	} else {
		theta_o = Math.PI / 2 + 0.75 * (theta - Math.PI / 3);
	}

	outObj.cyb = c * Math.cos(theta_o);
	outObj.crg = sign * c * Math.sin(theta_o);

	return outObj;
}

function orgbToLcc(outObj, Cyb, Crg) {
	const c = Math.hypot(Cyb, Crg);

	if (c < EPS_PRECISION) {
		outObj.C1 = 0.0;
		outObj.C2 = 0.0;

		return outObj;
	}

	const sign = Crg >= 0 ? 1 : -1,
		theta_o = Math.atan2(Math.abs(Crg), Cyb);

	let theta;

	if (theta_o < Math.PI / 2) {
		theta = (2 / 3) * theta_o;
	} else {
		theta = Math.PI / 3 + (4 / 3) * (theta_o - Math.PI / 2);
	}

	outObj.C1 = c * Math.cos(theta);
	outObj.C2 = sign * c * Math.sin(theta);

	return outObj;
}

export default {
	name: "oRGB",
	long: "Opponent RGB (oRGB)",
	css: "orgb",
	tags: ["opponent_space", "perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0.0, to: 1.0, step: 0.001, round: 3, name: "Luma", primary: true },
		cyb: { from: -1.0, to: 1.0, step: 0.001, round: 3, name: "Yellow-Blue" },
		crg: { from: -1.0, to: 1.0, step: 0.001, round: 3, name: "Red-Green" },
	},

	from: (orgb, out = {}) => {
		const L = orgb.l,
			Cyb = orgb.cyb * 2.0 - 1.0,
			Crg = orgb.crg * 2.0 - 1.0;

		const cc = orgbToLcc(allocObj(), Cyb, Crg);

		const Rp = 1.0 * L + 0.114 * cc.C1 + 0.7436 * cc.C2,
			Gp = 1.0 * L + 0.114 * cc.C1 - 0.4111 * cc.C2,
			Bp = 1.0 * L - 0.886 * cc.C1 + 0.1663 * cc.C2;

		freeObj(cc);

		const v3 = srgbToXyz(alloc3(), Rp, Gp, Bp);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const Rp = v3[0],
			Gp = v3[1],
			Bp = v3[2];

		const L = 0.299 * Rp + 0.587 * Gp + 0.114 * Bp,
			C1 = 0.5 * Rp + 0.5 * Gp - 1.0 * Bp,
			C2 = 0.866 * Rp - 0.866 * Gp + 0.0 * Bp;

		free3(v3);

		lccToOrgB(out, C1, C2);

		out.l = clamp(L, 0, 1, unclamped);
		out.cyb = clamp(out.cyb * 0.5 + 0.5, 0, 1, unclamped);
		out.crg = clamp(out.crg * 0.5 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, cyb: 0.5, crg: 0.5 },
		"#FFFFFF": { l: 1.0, cyb: 0.5, crg: 0.5 },
		"#FF0000": { l: 0.299, cyb: 0.5, crg: 1.0 },
		"#00FF00": { l: 0.587, cyb: 0.5, crg: 0.0 },
		"#0000FF": { l: 0.114, cyb: 0.0, crg: 0.5 },
		"#FFFF00": { l: 0.886, cyb: 1.0, crg: 0.5 },
		"#00FFFF": { l: 0.701, cyb: 0.1465, crg: 0.1465 },
		"#FF00FF": { l: 0.413, cyb: 0.1465, crg: 0.8535 },
		"#808080": { l: 0.502, cyb: 0.5, crg: 0.5 },
		"#FFA500": { l: 0.6788, cyb: 0.8783, crg: 0.7232 },
	},
};
