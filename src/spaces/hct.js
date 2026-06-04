import { allocObj, freeObj } from "../pool.js";
import { CAM_FL_ROOT, clamp, EPS_PRECISION, fLab, fLabInv, WHITEPOINT_D65 } from "../utils.js";
import cam16 from "./cam16.js";

const NEWTON_MAX_ITERS = 16;

const [WHITE_X, WHITE_Y, WHITE_Z] = WHITEPOINT_D65;

const params = cam16.bake({
	whitepoint: "D65",
	observer: "2",
});

function toneFromXyz(xyz) {
	const yRatio = xyz.y <= 0 ? 0 : xyz.y / WHITE_Y;

	return 116 * fLab(yRatio) - 16;
}

function toneToY(tone) {
	if (tone <= 0) {
		return 0;
	}

	if (tone >= 100) {
		return WHITE_Y;
	}

	return fLabInv((tone + 16) / 116) * WHITE_Y;
}

function labNeutralToXyz(outObj, tone) {
	if (tone <= 0) {
		outObj.x = 0;
		outObj.y = 0;
		outObj.z = 0;

		return outObj;
	}

	if (tone >= 100) {
		outObj.x = WHITE_X;
		outObj.y = WHITE_Y;
		outObj.z = WHITE_Z;

		return outObj;
	}

	const ratio = fLabInv((tone + 16) / 116);

	outObj.x = ratio * WHITE_X;
	outObj.y = ratio * WHITE_Y;
	outObj.z = ratio * WHITE_Z;

	return outObj;
}

function initialGuessJ(tone) {
	if (tone >= 0) {
		return 0.003790578348640494 * tone * tone + 0.6089841908066893 * tone + 0.9154856839591797;
	}

	return 9.514281401058887e-6 * tone * tone + 0.08693011228986187 * tone - 21.92910930537688;
}

function solveHctNewton(outObj, hue, chroma, tone) {
	const targetY = toneToY(tone),
		targetM = chroma * CAM_FL_ROOT;

	const camIn = allocObj(),
		camTmp = allocObj();

	camIn.j = 0;
	camIn.m = targetM / 105;
	camIn.h = hue;

	let J = initialGuessJ(tone),
		bestErr = Infinity,
		found = false;

	for (let i = 0; i < NEWTON_MAX_ITERS; i++) {
		camIn.j = J * 0.01;

		cam16.from(camIn, camTmp, params);

		const diff = camTmp.y - targetY,
			absDiff = Math.abs(diff);

		if (absDiff < bestErr) {
			found = true;
			bestErr = absDiff;

			outObj.x = camTmp.x;
			outObj.y = camTmp.y;
			outObj.z = camTmp.z;

			if (absDiff <= EPS_PRECISION) {
				break;
			}
		}

		const denom = camTmp.y <= 0 ? 0 : 2 * camTmp.y;

		if (denom === 0) {
			break;
		}

		const prevJ = J;

		J -= diff * (J / denom);

		if (!Number.isFinite(J)) {
			break;
		}

		if (J < 0) {
			J = 0;
		}

		if (Math.abs(prevJ - J) < EPS_PRECISION) {
			break;
		}
	}

	freeObj(camIn);
	freeObj(camTmp);

	return found ? outObj : labNeutralToXyz(outObj, tone);
}

export default {
	name: "HCT",
	long: "Hue Chroma Tone (CAM16 hue/chroma + CIELAB tone)",
	css: "hct",
	unbounded: true,
	lossy: true,
	tags: ["perceptual_uniform"],
	base: "CAM16 + CIELAB",
	ui: {
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
		c: { from: 0, to: 150, step: 0.5, round: 1, name: "Chroma" },
		t: { from: 0, to: 100, step: 1, round: 0, name: "Tone", primary: true },
	},
	options: cam16.options,
	bake: opts => cam16.bake(opts),

	from: (hct, out = {}) => {
		const chroma = clamp(hct.c, 0, 1) * 150,
			tone = clamp(hct.t, 0, 1) * 100;

		if (tone <= 0 || chroma < EPS_PRECISION) {
			return labNeutralToXyz(out, tone);
		}

		if (tone >= 100) {
			out.x = WHITE_X;
			out.y = WHITE_Y;
			out.z = WHITE_Z;

			return out;
		}

		return solveHctNewton(out, hct.h, chroma, tone);
	},
	to: (xyz, out = {}, unclamped = false) => {
		const tone = toneFromXyz(xyz);

		const jmh = cam16.to(xyz, allocObj(), true, params);

		const chroma = (jmh.m * 105) / CAM_FL_ROOT,
			hue = chroma < EPS_PRECISION ? 0 : jmh.h;

		freeObj(jmh);

		out.h = clamp(hue, 0, 1, unclamped);
		out.c = clamp(chroma / 150, 0, 1, unclamped);
		out.t = clamp(tone / 100, 0, 1, unclamped);

		return out;
	},
};
