import { resolveOptions } from "../options.js";
import { alloc3, free3 } from "../pool.js";
import {
	CAT02_INV_MATRIX,
	CAT02_MATRIX,
	CONE_TO_XYZ_JZAZBZ_MATRIX,
	clamp,
	DEG2RAD,
	EPS_PRECISION,
	makeMatrixPair,
	matmul,
	matmul3x3,
	invert3x3,
	optimizeMatrix,
	preAdaptBradford,
	PQ_MAX_LUMINANCE,
	PQ_P,
	PQ_P_INV,
	PRE_ADAPT_B,
	PRE_ADAPT_G,
	pqDecodeST2084,
	pqEncodeST2084,
	RAD2DEG,
	WHITEPOINT_E,
	WHITEPOINT_D65,
	XYZ_TO_CONE_JZAZBZ_MATRIX,
} from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

const [LMSP_TO_IZAZBZ, IZAZBZ_TO_LMSP] = makeMatrixPair([
	[0.0, 1.0, 0.0],
	[3.524, -4.066708, 0.542708],
	[0.199076, 1.096799, -1.295875],
]);

const IZ_OFFSET = 3.7035226210190005e-11;

const SURROUND_PRESETS = {
	average: { F: 1.0, C: 0.69 },
	dim: { F: 0.9, C: 0.59 },
	dark: { F: 0.8, C: 0.525 },
};

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
	referenceWhite: { type: "number", min: 1, max: 1000, default: 100, name: "Reference White Yw" },
	adaptingLuminance: { type: "number", min: 0.001, max: PQ_MAX_LUMINANCE, default: (64 / Math.PI) * 0.2, name: "Adapting Luminance (La, cd/m²)" },
	backgroundLuminance: { type: "number", min: 0.001, max: 1000, default: 20, name: "Background Luminance (Yb)" },
	surround: { type: "enum", allowed: ["average", "dim", "dark"], default: "average", name: "Surround" },
	discounting: { type: "boolean", default: false, name: "Discounting" },
};

function preAdaptXYZ(x, y, z, out) {
	out[0] = PRE_ADAPT_B * x - (PRE_ADAPT_B - 1) * z;
	out[1] = PRE_ADAPT_G * y - (PRE_ADAPT_G - 1) * x;
	out[2] = z;

	return out;
}

function undoPreAdaptXYZ(xA, yA, zA, out) {
	out[2] = zA;
	out[0] = (xA + (PRE_ADAPT_B - 1) * out[2]) / PRE_ADAPT_B;
	out[1] = (yA + (PRE_ADAPT_G - 1) * out[0]) / PRE_ADAPT_G;

	return out;
}

function adaptTwoStage(xB, yB, zB, xyzWb, xyzWd, dB, dD, xyzWo, out) {
	if (
		Math.abs(dB - dD) < EPS_PRECISION &&
		Math.abs(xyzWb[0] - xyzWd[0]) < EPS_PRECISION &&
		Math.abs(xyzWb[1] - xyzWd[1]) < EPS_PRECISION &&
		Math.abs(xyzWb[2] - xyzWd[2]) < EPS_PRECISION
	) {
		out[0] = xB;
		out[1] = yB;
		out[2] = zB;

		return out;
	}

	const yb = xyzWb[1] / xyzWo[1],
		yd = xyzWd[1] / xyzWo[1];

	const vB = matmul(alloc3(), CAT02_MATRIX, xB, yB, zB),
		vWb = matmul(alloc3(), CAT02_MATRIX, xyzWb[0], xyzWb[1], xyzWb[2]),
		vWd = matmul(alloc3(), CAT02_MATRIX, xyzWd[0], xyzWd[1], xyzWd[2]),
		vWo = matmul(alloc3(), CAT02_MATRIX, xyzWo[0], xyzWo[1], xyzWo[2]);

	const dRgbWb0 = dB * yb * (vWo[0] / vWb[0]) + (1 - dB),
		dRgbWb1 = dB * yb * (vWo[1] / vWb[1]) + (1 - dB),
		dRgbWb2 = dB * yb * (vWo[2] / vWb[2]) + (1 - dB);

	const dRgbWd0 = dD * yd * (vWo[0] / vWd[0]) + (1 - dD),
		dRgbWd1 = dD * yd * (vWo[1] / vWd[1]) + (1 - dD),
		dRgbWd2 = dD * yd * (vWo[2] / vWd[2]) + (1 - dD);

	const s0 = dRgbWb0 / dRgbWd0,
		s1 = dRgbWb1 / dRgbWd1,
		s2 = dRgbWb2 / dRgbWd2;

	out = matmul(out, CAT02_INV_MATRIX, s0 * vB[0], s1 * vB[1], s2 * vB[2]);

	free3(vB);
	free3(vWb);
	free3(vWd);
	free3(vWo);

	return out;
}

function computeFL(la) {
	return 0.171 * Math.cbrt(la) * (1 - Math.exp((-48 / 9) * la));
}

function degreeOfAdaptation(la, F) {
	const d = F * (1 - (1 / 3.6) * Math.exp((-la - 42) / 92));

	return clamp(d, 0, 1);
}

function xyzToIzAzBz(x, y, z, p, out) {
	matmul(out, p.toModel, x, y, z);

	preAdaptXYZ(out[0], out[1], out[2], out);

	matmul(out, XYZ_TO_CONE_JZAZBZ_MATRIX, out[0], out[1], out[2]);

	const lmsScaled0 = pqEncodeST2084(out[0] * p.PQ_SCALE, PQ_P),
		lmsScaled1 = pqEncodeST2084(out[1] * p.PQ_SCALE, PQ_P),
		lmsScaled2 = pqEncodeST2084(out[2] * p.PQ_SCALE, PQ_P);

	return matmul(out, LMSP_TO_IZAZBZ, lmsScaled0, lmsScaled1, lmsScaled2);
}

function izazbzToXyz(iz, az, bz, p, out) {
	matmul(out, IZAZBZ_TO_LMSP, iz, az, bz);

	const lps1 = pqDecodeST2084(out[0], PQ_P_INV),
		lps2 = pqDecodeST2084(out[1], PQ_P_INV),
		lps3 = pqDecodeST2084(out[2], PQ_P_INV);

	matmul(out, CONE_TO_XYZ_JZAZBZ_MATRIX, lps1 / p.PQ_SCALE, lps2 / p.PQ_SCALE, lps3 / p.PQ_SCALE);

	const xA = out[0],
		yA = out[1],
		zA = out[2];

	undoPreAdaptXYZ(xA, yA, zA, out);

	matmul(out, p.fromModel, out[0], out[1], out[2]);

	return out;
}

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const { F, C } = SURROUND_PRESETS[opts.surround],
		Yw = opts.referenceWhite,
		Yb = opts.backgroundLuminance,
		La = opts.adaptingLuminance;

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer);

	const FL = computeFL(La),
		FB = Math.sqrt(Yb / Yw),
		ALPHA = (1.6 * C) / Math.pow(FB, 0.12),
		KQ = Math.pow(C, 2.2) * Math.pow(FB, 0.5) * Math.pow(FL, 0.2);

	const D_ADAPT = opts.discounting ? 1.0 : degreeOfAdaptation(La, F);
	const identity = optimizeMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
	const [toNative] = preAdaptBradford(identity, WHITEPOINT_D65, wp);
	const adaptation = new Float64Array(9);
	const column = alloc3();

	for (let index = 0; index < 3; index++) {
		adaptTwoStage(index === 0 ? 1 : 0, index === 1 ? 1 : 0, index === 2 ? 1 : 0, wp, WHITEPOINT_D65, D_ADAPT, D_ADAPT, WHITEPOINT_E, column);
		adaptation[index] = column[0];
		adaptation[index + 3] = column[1];
		adaptation[index + 6] = column[2];
	}

	free3(column);
	const toModel = matmul3x3(adaptation, toNative);

	const bakeParams = {
		FL: FL,
		D_ADAPT: D_ADAPT,
		wp: wp,
		PQ_SCALE: Yw / PQ_MAX_LUMINANCE,
		toModel: identity,
	};

	const wpOut = xyzToIzAzBz(wp[0], wp[1], wp[2], bakeParams, alloc3()),
		iz_w_raw = wpOut[0];

	free3(wpOut);

	const iz_w = Math.max(iz_w_raw - IZ_OFFSET, 0),
		QZ_W = 2700 * Math.pow(iz_w, ALPHA) * KQ;
	bakeParams.toModel = toModel;
	bakeParams.fromModel = invert3x3(toModel);

	return {
		...bakeParams,
		opts: opts,
		F: F,
		C: C,
		Yw: Yw,
		Yb: Yb,
		La: La,
		FB: FB,
		ALPHA: ALPHA,
		KQ: KQ,
		QZ_W: QZ_W,
		M_FACTOR: 100 * Math.pow(FL, 0.2) / (Math.pow(FB, 0.1) * Math.pow(iz_w, 0.78)),
	};
}

const defaults = makeParams();

export const sharedShaderConstants = {
	LMSP_TO_IZAZBZ: LMSP_TO_IZAZBZ,
	IZAZBZ_TO_LMSP: IZAZBZ_TO_LMSP,
	IZ_OFFSET: IZ_OFFSET,
};

export default {
	name: "ZCAM JMh",
	long: "ZCAM (Zhai & Luo), J-M-h (average surround, D65/2°)",
	css: "zcam-jmh",
	tags: ["appearance_model", "hdr"],
	base: "CIE 1931 XYZ",
	ui: {
		Jz: { from: 0, to: 100, step: 1, round: 0, name: "Lightness Jz", primary: true },
		Mz: { from: 0, to: 80, step: 1, round: 0, name: "Colorfulness Mz" },
		Hz: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	options: options,
	bake: makeParams,

	from: (jmh, out = {}, params = defaults) => {
		const Jn = jmh.Jz,
			Qz = Jn * params.QZ_W;

		const IzPrime = Math.pow(Math.max(Qz / (2700 * params.KQ), 0), 1 / params.ALPHA),
			iz = IzPrime + IZ_OFFSET;

		const Hdeg = (jmh.Hz || 0) * 360,
			Hrad = Hdeg * DEG2RAD;

		const eccentricity = 1.015 + Math.cos((89.038 + Hdeg) * DEG2RAD),
			C = Math.pow(Math.max(jmh.Mz * 80, 0) / (params.M_FACTOR * Math.pow(eccentricity, 0.068)), 1 / 0.74);

		const az = C * Math.cos(Hrad),
			bz = C * Math.sin(Hrad);

		const v3 = izazbzToXyz(iz, az, bz, params, alloc3());

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const v3 = alloc3();

		xyzToIzAzBz(xyz.x, xyz.y, xyz.z, params, v3);

		const izRaw = v3[0],
			az = v3[1],
			bz = v3[2];

		free3(v3);

		const izp = Math.max(izRaw - IZ_OFFSET, 0),
			Qz = 2700 * Math.pow(izp, params.ALPHA) * params.KQ,
			Jz = params.QZ_W > 0 ? Qz / params.QZ_W : 0;

		const C = Math.sqrt(az * az + bz * bz);

		let hDeg = 0;

		if (C > EPS_PRECISION) {
			hDeg = Math.atan2(bz, az) * RAD2DEG;

			if (hDeg < 0) {
				hDeg += 360;
			}
		}

		const eccentricity = 1.015 + Math.cos((89.038 + hDeg) * DEG2RAD),
			Mz = params.M_FACTOR * Math.pow(C, 0.74) * Math.pow(eccentricity, 0.068) / 80;

		out.Jz = clamp(Jz, 0, 1, unclamped);
		out.Mz = clamp(Mz, 0, 1, unclamped);
		out.Hz = clamp(C > EPS_PRECISION ? hDeg / 360 : 0, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { Jz: 0, Mz: 0, Hz: 0 },
		"#FFFFFF": { Jz: 1, Mz: 0.004643, Hz: 0.534086 },
		"#FF0000": { Jz: 0.511851, Mz: 0.547151, Hz: 0.117989 },
		"#00FF00": { Jz: 0.810905, Mz: 0.542537, Hz: 0.368663 },
		"#0000FF": { Jz: 0.434777, Mz: 0.695547, Hz: 0.718926 },
		"#FFFF00": { Jz: 0.928436, Mz: 0.420637, Hz: 0.282847 },
		"#00FFFF": { Jz: 0.898441, Mz: 0.354642, Hz: 0.565986 },
		"#FF00FF": { Jz: 0.664009, Mz: 0.561598, Hz: 0.891053 },
		"#808080": { Jz: 0.49964, Mz: 0.003512, Hz: 0.534087 },
		"#FFA500": { Jz: 0.712697, Mz: 0.403816, Hz: 0.208499 },
	},
};
