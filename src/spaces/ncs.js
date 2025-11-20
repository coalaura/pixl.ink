import { alloc3, allocObj, free3, freeObj } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, xyzToSrgb } from "../utils.js";

function getWeights(outObj, h) {
	const H = h % 400;

	let Ra = 0,
		Ga = 0,
		Ba = 0;

	if (H < 100) {
		const N = H;

		if (N <= 60) {
			Ra = 1.0;
		} else {
			const x1 = N - 60;

			Ra = (Math.sqrt(14884 - x1 * x1) - 22) / 100;
		}

		Ga = (85 - (17 / 20) * N) / 100;

		if (N <= 80) {
			Ba = 0.0;
		} else {
			const x2 = N - 80 + 20.5;

			Ba = (104 - Math.sqrt(11236 - x2 * x2)) / 100;
		}
	} else if (H < 200) {
		const N = H - 100;

		if (N <= 80) {
			const x1 = N + 40;

			Ra = (Math.sqrt(14884 - x1 * x1) - 22) / 100;
		} else {
			Ra = 0.0;
		}

		Ga = 0.0;

		if (N <= 60) {
			const x2 = N + 20 + 20.5;

			Ba = (104 - Math.sqrt(11236 - x2 * x2)) / 100;
		} else {
			const x3 = N - 60 - 60;

			Ba = (Math.sqrt(10000 - x3 * x3) - 10) / 100;
		}
	} else if (H < 300) {
		const N = H - 200;

		Ra = 0.0;

		if (N <= 60) {
			const x8 = 1 * N - 68.5;

			Ga = (6.5 + Math.sqrt(7044.5 - x8 * x8)) / 100;
		} else {
			Ga = 0.9;
		}

		if (N <= 80) {
			const x3 = N + 40 - 60;

			Ba = (Math.sqrt(10000 - x3 * x3) - 10) / 100;
		} else {
			const x5 = N - 80 - 131;

			Ba = (122 - Math.sqrt(19881 - x5 * x5)) / 100;
		}
	} else {
		const N = H - 300;

		if (N <= 170) {
			const x1 = N - 170;

			Ra = (Math.sqrt(33800 - x1 * x1) - 70) / 100;
		} else {
			Ra = 0.0;
		}

		if (N <= 60) {
			Ga = 0.9;
		} else {
			const x7 = N - 60;

			Ga = (90 - (1 / 8) * x7) / 100;
		}

		if (N <= 40) {
			const x5 = N + 20 - 131;

			Ba = (122 - Math.sqrt(19881 - x5 * x5)) / 100;
		} else {
			Ba = 0.0;
		}
	}

	outObj.Ra = Ra;
	outObj.Ga = Ga;
	outObj.Ba = Ba;

	return outObj;
}

function solveHue(r, g, b) {
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b),
		delta = max - min;

	if (delta < EPS_PRECISION) {
		return 0;
	}

	let hEst = 0;

	if (max === r) {
		hEst = ((g - b) / delta) % 6;
	} else if (max === g) {
		hEst = (b - r) / delta + 2;
	} else {
		hEst = (r - g) / delta + 4;
	}

	hEst = hEst * 60;

	if (hEst < 0) {
		hEst += 360;
	}

	let _phiEst = 0;

	if (hEst < 60) {
		_phiEst = (hEst / 60) * 50;
	} else if (hEst < 120) {
		_phiEst = 50 + ((hEst - 60) / 60) * 100;
	} else {
		_phiEst = (hEst / 360) * 400;
	}

	const avgInput = (r + g + b) / 3,
		dr = r - avgInput,
		dg = g - avgInput,
		db = b - avgInput,
		range = Math.sqrt(dr * dr + dg * dg + db * db);

	let bestH = 0,
		maxSim = -1;

	const w = allocObj();

	for (let h = 0; h < 400; h += 5) {
		getWeights(w, h);

		const avgW = (w.Ra + w.Ga + w.Ba) / 3,
			dRa = w.Ra - avgW,
			dGa = w.Ga - avgW,
			dBa = w.Ba - avgW,
			normW = Math.sqrt(dRa * dRa + dGa * dGa + dBa * dBa);

		if (normW > EPS_PRECISION) {
			const sim = (dr * dRa + dg * dGa + db * dBa) / (range * normW);

			if (sim > maxSim) {
				maxSim = sim;
				bestH = h;
			}
		}
	}

	let step = 2;

	for (let i = 0; i < 5; i++) {
		let changed = false;

		for (const d of [-step, step]) {
			const h = bestH + d;

			getWeights(w, h);

			const avgW = (w.Ra + w.Ga + w.Ba) / 3,
				dRa = w.Ra - avgW,
				dGa = w.Ga - avgW,
				dBa = w.Ba - avgW,
				normW = Math.sqrt(dRa * dRa + dGa * dGa + dBa * dBa);

			if (normW > EPS_PRECISION) {
				const sim = (dr * dRa + dg * dGa + db * dBa) / (range * normW);

				if (sim > maxSim) {
					maxSim = sim;
					bestH = h;
					changed = true;
				}
			}
		}
		if (!changed) {
			step *= 0.5;
		}
	}

	freeObj(w);

	return (bestH + 400) % 400;
}

function formatNcs(s, c, h) {
	const S = Math.round(s),
		C = Math.round(c);

	let hueStr = "N";

	if (C > 0) {
		const quadrant = Math.floor(h / 100) % 4,
			fraction = Math.round(h % 100),
			families = ["Y", "R", "B", "G", "Y"];

		if (fraction === 0) {
			hueStr = families[quadrant];
		} else {
			hueStr = `${families[quadrant]}${fraction.toString().padStart(2, "0")}${families[quadrant + 1]}`;
		}
	}

	return `NCS S ${S.toString().padStart(2, "0")}${C.toString().padStart(2, "0")}-${hueStr}`;
}

const N_FACTOR = 1.05,
	N_OFFSET = 5.25;

export default {
	name: "NCS",
	long: "Natural Color System",
	css: "ncs",
	tags: ["notation_system", "perceptual_uniform", "cylindrical_model"],
	base: "sRGB",
	lossy: true,
	ui: {
		s: { from: 0, to: 100, step: 1, round: 0, name: "Blackness S", primary: true },
		c: { from: 0, to: 100, step: 1, round: 0, name: "Chromaticness C" },
		h: { from: 0, to: 400, step: 1, round: 0, name: "Hue (Phi)" },
	},

	from: (ncs, out = {}) => {
		const S_user = ncs.s * 100,
			C_user = ncs.c * 100,
			H_user = ncs.h * 400;

		let r = 0,
			g = 0,
			b = 0;

		if (C_user === 0) {
			const v = 1 - S_user / 100;

			r = g = b = v;
		} else {
			const w = getWeights(allocObj(), H_user);

			const c = C_user / 100,
				avg = (w.Ra + w.Ga + w.Ba) / 3;

			const Rc = avg * (1 - c) + w.Ra * c,
				Gc = avg * (1 - c) + w.Ga * c,
				Bc = avg * (1 - c) + w.Ba * c;

			freeObj(w);

			const S_internal = N_FACTOR * S_user - N_OFFSET,
				maxVal = Math.max(Rc, Gc, Bc),
				ss = maxVal > EPS_PRECISION ? 1 / maxVal : 0;

			const factor = (ss * (100 - S_internal)) / 100;

			r = Rc * factor;
			g = Gc * factor;
			b = Bc * factor;
		}

		const v3 = srgbToXyz(alloc3(), clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1));

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},

	to: (xyz, out = {}, unclamped = false) => {
		const rgb = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const r = clamp(rgb[0], 0, 1, unclamped),
			g = clamp(rgb[1], 0, 1, unclamped),
			b = clamp(rgb[2], 0, 1, unclamped);

		free3(rgb);

		if (Math.abs(r - g) < 0.01 && Math.abs(g - b) < 0.01 && Math.abs(r - b) < 0.01) {
			const avg = (r + g + b) / 3;

			out.s = clamp(1 - avg, 0, 1, unclamped);
			out.c = 0;
			out.h = 0;

			return out;
		}

		const H = solveHue(r, g, b);

		const maxRgb = Math.max(r, g, b),
			S_internal = 100 * (1 - maxRgb),
			S_user = (S_internal + N_OFFSET) / N_FACTOR;

		const w = getWeights(allocObj(), H),
			avgW = (w.Ra + w.Ga + w.Ba) / 3;

		const rNorm = r / (maxRgb || 1),
			gNorm = g / (maxRgb || 1),
			bNorm = b / (maxRgb || 1);

		let bestC = 0,
			minErr = Infinity;

		for (let c = 0; c <= 100; c += 1) {
			const cf = c / 100,
				Rc = avgW * (1 - cf) + w.Ra * cf,
				Gc = avgW * (1 - cf) + w.Ga * cf,
				Bc = avgW * (1 - cf) + w.Ba * cf,
				maxC = Math.max(Rc, Gc, Bc);

			const Rn = Rc / (maxC || 1),
				Gn = Gc / (maxC || 1),
				Bn = Bc / (maxC || 1);

			const err = (Rn - rNorm) ** 2 + (Gn - gNorm) ** 2 + (Bn - bNorm) ** 2;

			if (err < minErr) {
				minErr = err;
				bestC = c;
			}
		}

		freeObj(w);

		out.s = clamp(S_user / 100, 0, 1, unclamped);
		out.c = clamp(bestC / 100, 0, 1, unclamped);
		out.h = clamp(H / 400, 0, 1, unclamped);

		return out;
	},

	format: sch => {
		return formatNcs(sch.s * 100, sch.c * 100, sch.h * 400);
	},
};
