import { alloc3, free3 } from "./pool.js";
import { getWhitepointXYZ } from "./whites/points.js";

// Whitepoints
export const WHITEPOINT_C = getWhitepointXYZ("C", "2");
export const WHITEPOINT_D50 = getWhitepointXYZ("D50", "2");
export const WHITEPOINT_D60 = getWhitepointXYZ("D60", "2");
export const WHITEPOINT_D65 = getWhitepointXYZ("D65", "2");
export const WHITEPOINT_E = getWhitepointXYZ("E", "2");

// Numeric constants
export const EPS_PRECISION = 1e-12;
export const EPS_PERCEPTUAL = 1e-3;

export const TAU = 2 * Math.PI;
export const RAD2DEG = 180 / Math.PI;
export const DEG2RAD = Math.PI / 180;

// Matrices
export const [BRADFORD_MATRIX, BRADFORD_INV_MATRIX] = makeMatrixPair([
	[0.8951, 0.2664, -0.1614],
	[-0.7502, 1.7135, 0.0367],
	[0.0389, -0.0685, 1.0296],
]);

export const [CAT02_MATRIX, CAT02_INV_MATRIX] = makeMatrixPair([
	[0.7328, 0.4296, -0.1624],
	[-0.7036, 1.6975, 0.0061],
	[0.003, 0.0136, 0.9834],
]);

export const [CAT16_MATRIX, CAT16_INV_MATRIX] = makeMatrixPair([
	[0.401288, 0.650173, -0.051461],
	[-0.250268, 1.204414, 0.045854],
	[-0.002079, 0.048952, 0.953127],
]);

export const M1_MATRIX = optimizeMatrix([
	[460.0, 451.0, 288.0],
	[460.0, -891.0, -261.0],
	[460.0, -220.0, -6300.0],
]);

export const [REC2020_TO_XYZ_MATRIX, XYZ_TO_REC2020_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.708, 0.292],
		[0.17, 0.797],
		[0.131, 0.046],
	],
	WHITEPOINT_D65
);

const [AP1_TO_XYZ_D60] = generateMatricesFromPrimaries(
	[
		[0.713, 0.293],
		[0.165, 0.83],
		[0.128, 0.044],
	],
	WHITEPOINT_D60
);

export const [AP1_TO_XYZ_MATRIX, XYZ_TO_AP1_MATRIX] = preAdaptBradford(AP1_TO_XYZ_D60, WHITEPOINT_D60, WHITEPOINT_D65);

export const [CONE_TO_XYZ_JZAZBZ_MATRIX, XYZ_TO_CONE_JZAZBZ_MATRIX] = makeMatrixPair([
	[1.9242264357876067, -1.0047923125953657, 0.037651404030618],
	[0.3503167620949991, 0.7264811939316552, -0.065384422948085],
	[-0.0909828109828475, -0.3127282905230739, 1.5227665613052603],
]);

export const [OKLAB_TO_LMS_PRIME_MATRIX, LMS_PRIME_TO_OKLAB_MATRIX] = makeMatrixPair([
	[1.0, 0.3963377774, 0.2158037573],
	[1.0, -0.1055613458, -0.0638541728],
	[1.0, -0.0894841775, -1.291485548],
]);

export const [OKLAB_LMS_TO_XYZ_MATRIX, OKLAB_XYZ_TO_LMS_MATRIX] = makeMatrixPair([
	[1.2270138511, -0.5577999807, 0.281256149],
	[-0.0405801784, 1.1122568696, -0.0716766787],
	[-0.0763812845, -0.4214819784, 1.5861632204],
]);

export const LMS_TO_SRGB_LINEAR_MATRIX = optimizeMatrix([
	[4.0767416360759583, -3.3077115392580629, 0.2309699031821043],
	[-1.2684379732850315, 2.6097573492876882, -0.341319376002657],
	[-0.0041960761386756, -0.7034186179359362, 1.7076146940746117],
]);

export const [LINEAR_RGB_TO_XYZ_MATRIX, XYZ_TO_LINEAR_RGB_MATRIX] = generateMatricesFromPrimaries(
	[
		[0.64, 0.33],
		[0.3, 0.6],
		[0.15, 0.06],
	],
	WHITEPOINT_D65
);

export const OK_GAMUT_RGB_COEFFS = [
	[
		[-1.8817031, -0.80936501],
		[1.19086277, 1.76576728, 0.59662641, 0.75515197, 0.56771245],
	],
	[
		[1.8144408, -1.19445267],
		[0.73956515, -0.45954404, 0.08285427, 0.12541073, -0.14503204],
	],
	[
		[0.13110758, 1.81333971],
		[1.35733652, -0.00915799, -1.1513021, -0.50559606, 0.00692167],
	],
];

export const [LMS_TO_XYZ_HPE_MATRIX, XYZ_TO_LMS_HPE_MATRIX] = makeMatrixPair([
	[1.9101968341704306, -1.1121238620490023, 0.2019072850149422],
	[0.370950088249105, 0.6290541866113667, -0.0000018248604712],
	[0.0, 0.0, 1.0],
]);

export const [XYZ_TO_LMS_2006_MATRIX, LMS_2006_TO_XYZ_MATRIX] = makeMatrixPair([
	[0.185082982238733, 0.584081279463687, -0.0240722415044404],
	[-0.134433056469973, 0.405752392775348, 0.0358252602217631],
	[0.000789456671966863, -0.000912281325916184, 0.0198490812339463],
]);

export const [LMS_TO_XYZ_BT2100_IPT_MATRIX, XYZ_TO_LMS_BT2100_IPT_MATRIX] = makeMatrixPair([
	[2.0701522183894223, -1.3263473389671563, 0.2066510476294053],
	[0.3647385209748072, 0.6805660249472273, -0.0453045459220347],
	[-0.0497472075358123, -0.0492609666966131, 1.1880659249923042],
]);

export const [LMS_TO_IPT_BT2100_MATRIX, IPT_TO_LMS_BT2100_MATRIX] = makeMatrixPair([
	[2048 / 4096, 2048 / 4096, 0],
	[6610 / 4096, -13613 / 4096, 7003 / 4096],
	[17933 / 4096, -17390 / 4096, -543 / 4096],
]);

// Luma constants
export const LUMA_BT709 = {
	KR: 0.2126,
	KG: 0.7152,
	KB: 0.0722,
};

export const LUMA_BT601 = {
	KR: 0.299,
	KG: 0.587,
	KB: 0.114,
};

// Model Constants
export const JZAZBZ_AZBZ_SCALE = 0.42;

export const CAM_ADAPTED_COEF = 0.42;
export const CAM_ADAPTED_COEF_INV = 1 / CAM_ADAPTED_COEF;

export const CAM_UCS_K = 1.7;
export const CAM_UCS_C1 = 0.007;
export const CAM_UCS_C2 = 0.0228;

export const LAB_EPSILON = 216 / 24389;
export const LAB_KAPPA = 24389 / 27;

export const OK_TOE_K1 = 0.206;
export const OK_TOE_K2 = 0.03;
export const OK_TOE_K3 = (1 + OK_TOE_K1) / (1 + OK_TOE_K2);

export const HLG_A = 0.17883277;
export const HLG_B = 1 - 4 * HLG_A;
export const HLG_C = 0.55991073;

export const PRE_ADAPT_B = 1.15;
export const PRE_ADAPT_G = 0.66;

export const PQ_M1 = 2610 / 16384;
export const PQ_M1_INV = 1 / PQ_M1;

export const PQ_M2 = 2523 / 32;
export const PQ_M2_INV = 1 / PQ_M2;

export const PQ_C1 = 3424 / 4096;
export const PQ_C2 = 2413 / 128;
export const PQ_C3 = 2392 / 128;

export const PQ_P = 134.034375;
export const PQ_P_INV = 1 / PQ_P;

export const PQ_MAX_LUMINANCE = 10000;
export const HDR_REFERENCE_WHITE_NITS = 203;
export const PQ_LUMINANCE_SCALE = HDR_REFERENCE_WHITE_NITS / PQ_MAX_LUMINANCE;

export const CAM_DEFAULTS = {
	LA: (64 / Math.PI) * 0.2,
	YB: 20,
	F: 1.0,
	C: 0.69,
	NC: 1.0,
};

// Helpers
export function clamp(value, min, max, skip = false) {
	if (skip) {
		return value;
	}

	if (value > max) {
		return max;
	}

	if (value < min) {
		return min;
	}

	return value;
}

export function lerp(start, end, t) {
	return start * (1 - t) + end * t;
}

const fracZerosRgx = /(?:(\.\d*?[1-9])0+|\.0+)$/;

export function round(num, digits) {
	return num.toFixed(digits).replace(fracZerosRgx, "$1") || "0";
}

export function optimizeMatrix(matrix) {
	return new Float64Array([matrix[0][0], matrix[0][1], matrix[0][2], matrix[1][0], matrix[1][1], matrix[1][2], matrix[2][0], matrix[2][1], matrix[2][2]]);
}

export function makeMatrixPair(base) {
	const forward = optimizeMatrix(base),
		inverse = invert3x3(forward);

	return [forward, inverse];
}

export function matmul(out, matrix, v1, v2, v3) {
	out[0] = matrix[0] * v1 + matrix[1] * v2 + matrix[2] * v3;
	out[1] = matrix[3] * v1 + matrix[4] * v2 + matrix[5] * v3;
	out[2] = matrix[6] * v1 + matrix[7] * v2 + matrix[8] * v3;

	return out;
}

export function matmul3x3(a, b) {
	return optimizeMatrix([
		[a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8]],
		[a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8]],
		[a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8]],
	]);
}

export function invert3x3(m) {
	const a = m[0],
		b = m[1],
		c = m[2];

	const d = m[3],
		e = m[4],
		f = m[5];

	const g = m[6],
		h = m[7],
		i = m[8];

	const A = e * i - f * h,
		B = -(d * i - f * g),
		C = d * h - e * g,
		D = -(b * i - c * h),
		E = a * i - c * g,
		F = -(a * h - b * g),
		G = b * f - c * e,
		H = -(a * f - c * d),
		I = a * e - b * d;

	const det = a * A + b * B + c * C;

	if (Math.abs(det) < EPS_PRECISION) {
		throw new Error("Non-invertible matrix");
	}

	const invDet = 1 / det;

	return optimizeMatrix([
		[A * invDet, D * invDet, G * invDet],
		[B * invDet, E * invDet, H * invDet],
		[C * invDet, F * invDet, I * invDet],
	]);
}

export function generateMatricesFromPrimaries(primaries, referenceWhite) {
	const rx = primaries[0][0],
		ry = primaries[0][1];

	const gx = primaries[1][0],
		gy = primaries[1][1];

	const bx = primaries[2][0],
		by = primaries[2][1];

	const rz = 1 - rx - ry,
		gz = 1 - gx - gy,
		bz = 1 - bx - by;

	const Xr = rx / ry,
		Yr = 1,
		Zr = rz / ry;

	const Xg = gx / gy,
		Yg = 1,
		Zg = gz / gy;

	const Xb = bx / by,
		Yb = 1,
		Zb = bz / by;

	const M = optimizeMatrix([
		[Xr, Xg, Xb],
		[Yr, Yg, Yb],
		[Zr, Zg, Zb],
	]);

	const Minv = invert3x3(M);

	const S = matmul(alloc3(), Minv, referenceWhite[0], referenceWhite[1], referenceWhite[2]);

	const Sr = S[0],
		Sg = S[1],
		Sb = S[2];

	free3(S);

	const rgbToXyz = optimizeMatrix([
		[Xr * Sr, Xg * Sg, Xb * Sb],
		[Yr * Sr, Yg * Sg, Yb * Sb],
		[Zr * Sr, Zg * Sg, Zb * Sb],
	]);

	return [rgbToXyz, invert3x3(rgbToXyz)];
}

export function spow(base, exp) {
	if (Math.abs(base) < EPS_PRECISION) {
		return 0;
	}

	return Math.sign(base) * (Math.abs(base) ** exp);
}

export function copySign(magnitude, sign) {
	return Math.sign(sign) * Math.abs(magnitude);
}

export function zdiv(a, b) {
	return Math.abs(b) < EPS_PRECISION ? 0 : a / b;
}

export function normalizeAngle360(deg) {
	return ((deg % 360) + 360) % 360;
}

export function normalizeAngleRad(rad) {
	return ((rad % TAU) + TAU) % TAU;
}

// Hex
export function rgbToHex(rgb) {
	const r = clamp(rgb.r, 0, 1),
		g = clamp(rgb.g, 0, 1),
		b = clamp(rgb.b, 0, 1);

	const h = Math.round(r * 255)
			.toString(16)
			.padStart(2, "0"),
		e = Math.round(g * 255)
			.toString(16)
			.padStart(2, "0"),
		x = Math.round(b * 255)
			.toString(16)
			.padStart(2, "0");

	return `#${h}${e}${x}`;
}

export function hexToRgb(hex) {
	if (hex.startsWith("#")) {
		hex = hex.slice(1);
	}

	let r, g, b;

	if (hex.length === 3) {
		r = parseInt(hex.substring(0, 1), 16);
		g = parseInt(hex.substring(1, 2), 16);
		b = parseInt(hex.substring(2, 3), 16);
	} else {
		const val = parseInt(hex, 16);

		r = ((val >> 16) & 0xff) / 255;
		g = ((val >> 8) & 0xff) / 255;
		b = (val & 0xff) / 255;
	}

	return {
		r: r,
		g: g,
		b: b,
	};
}

// Transfers
export function srgbToLinear(v) {
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgb(v) {
	return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
}

export function rec709ToLinear(v) {
	return v <= 0.081 ? v / 4.5 : ((v + 0.099) / 1.099) ** (1 / 0.45);
}

export function linearToRec709(v) {
	return v <= 0.018 ? 4.5 * v : 1.099 * v ** 0.45 - 0.099;
}

export function adobeRgbToLinear(v) {
	v = clamp(v, 0, 1);

	return v ** 2.19921875;
}

export function linearToAdobeRgb(v) {
	v = clamp(v, 0, 1);

	return spow(v, 1 / 2.19921875);
}

export function prophotoToLinear(v) {
	return v <= 0.031248 ? v / 16 : v ** 1.8;
}

export function linearToProphoto(v) {
	return v <= 0.001953 ? v * 16 : v ** (1 / 1.8);
}

// XYZ <-> RGB
export function linearRgbToXyz(out, r, g, b) {
	return matmul(out, LINEAR_RGB_TO_XYZ_MATRIX, r, g, b);
}

export function xyzToLinearRgb(out, x, y, z) {
	return matmul(out, XYZ_TO_LINEAR_RGB_MATRIX, x, y, z);
}

export function srgbToXyz(out, r, g, b) {
	return linearRgbToXyz(out, srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
}

export function xyzToSrgb(out, x, y, z) {
	out = xyzToLinearRgb(out, x, y, z);

	out[0] = linearToSrgb(out[0]);
	out[1] = linearToSrgb(out[1]);
	out[2] = linearToSrgb(out[2]);

	return out;
}

// HLG / PQ
export function hlgEncode(l) {
	const L = Math.max(0, Math.min(1, l));

	return L <= 1 / 12 ? Math.sqrt(3 * L) : HLG_A * Math.log(12 * L - HLG_B) + HLG_C;
}

export function hlgDecode(e) {
	const E = Math.max(0, Math.min(1, e));

	return E <= 0.5 ? (E * E) / 3 : (Math.exp((E - HLG_C) / HLG_A) + HLG_B) / 12;
}

export function pqEncodeST2084(L_abs, pow = PQ_M2) {
	const Lp = Math.max(0, L_abs),
		Lm1 = Lp ** PQ_M1,
		num = PQ_C1 + PQ_C2 * Lm1,
		den = 1 + PQ_C3 * Lm1;

	if (Math.abs(den) < EPS_PRECISION) {
		return 0;
	}

	return (num / den) ** pow;
}

export function pqDecodeST2084(E, pow = PQ_M2_INV) {
	const Ep = Math.max(0, E),
		p = Ep ** pow,
		num = Math.max(p - PQ_C1, 0),
		den = PQ_C2 - PQ_C3 * p;

	if (Math.abs(den) < EPS_PRECISION) {
		return 0;
	}

	return (num / den) ** PQ_M1_INV;
}

// Lab helpers
export function fLab(t) {
	return t > LAB_EPSILON ? Math.cbrt(t) : (LAB_KAPPA * t + 16) / 116;
}

export function fLabInv(ft) {
	const ft3 = ft * ft * ft;

	return ft3 > LAB_EPSILON ? ft3 : (116 * ft - 16) / LAB_KAPPA;
}

// HSLuv/HPLuv helpers
export function hsLuvBounds(L) {
	const sub1 = (L + 16) ** 3 / 1560896,
		sub2 = sub1 > LAB_EPSILON ? sub1 : L / LAB_KAPPA;

	const lines = [];

	for (let c = 0; c < 3; c++) {
		const m1 = XYZ_TO_LINEAR_RGB_MATRIX[c * 3],
			m2 = XYZ_TO_LINEAR_RGB_MATRIX[c * 3 + 1],
			m3 = XYZ_TO_LINEAR_RGB_MATRIX[c * 3 + 2];

		for (let t = 0; t < 2; t++) {
			const top1 = (284517 * m1 - 94839 * m3) * sub2,
				top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L,
				bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;

			lines.push({
				slope: top1 / bottom,
				intercept: top2 / bottom,
			});
		}
	}

	return lines;
}

// Adaptation
export function preAdaptBradford(M_RGB_TO_XYZ, srcWP, dstWP) {
	const srcLMS = matmul(alloc3(), BRADFORD_MATRIX, srcWP[0], srcWP[1], srcWP[2]),
		dstLMS = matmul(alloc3(), BRADFORD_MATRIX, dstWP[0], dstWP[1], dstWP[2]);

	const sx = dstLMS[0] / srcLMS[0],
		sy = dstLMS[1] / srcLMS[1],
		sz = dstLMS[2] / srcLMS[2];

	free3(srcLMS);
	free3(dstLMS);

	const SBM = matmul3x3(
		optimizeMatrix([
			[sx, 0, 0],
			[0, sy, 0],
			[0, 0, sz],
		]),
		matmul3x3(BRADFORD_MATRIX, M_RGB_TO_XYZ)
	);

	const M_adapted = matmul3x3(BRADFORD_INV_MATRIX, SBM),
		M_adapted_inv = invert3x3(M_adapted);

	return [M_adapted, M_adapted_inv];
}

function camAdaptOne(v, fl) {
	const absC = Math.abs(v);

	if (absC < EPS_PRECISION) {
		return 0;
	}

	const x = spow(fl * absC * 0.01, CAM_ADAPTED_COEF);

	return (400 * copySign(x, v)) / (x + 27.13);
}

function camUnadaptOne(v, cns) {
	const cabs = Math.abs(v);

	if (cabs < EPS_PRECISION || cabs >= 400) {
		return 0;
	}

	return copySign(cns * spow(cabs / (400 - cabs), CAM_ADAPTED_COEF_INV), v);
}

export function camAdapt(out, v1, v2, v3, fl) {
	out[0] = camAdaptOne(v1, fl);
	out[1] = camAdaptOne(v2, fl);
	out[2] = camAdaptOne(v3, fl);

	return out;
}

export function camUnadapt(out, v1, v2, v3, fl) {
	const constant = (100 / fl) * 27.13 ** CAM_ADAPTED_COEF_INV;

	out[0] = camUnadaptOne(v1, constant);
	out[1] = camUnadaptOne(v2, constant);
	out[2] = camUnadaptOne(v3, constant);

	return out;
}

// OKLab helpers
export function okToe(x) {
	return 0.5 * (OK_TOE_K3 * x - OK_TOE_K1 + Math.sqrt((OK_TOE_K3 * x - OK_TOE_K1) * (OK_TOE_K3 * x - OK_TOE_K1) + 4 * OK_TOE_K2 * OK_TOE_K3 * x));
}

export function okToeInv(x) {
	return (x * x + OK_TOE_K1 * x) / (OK_TOE_K3 * (x + OK_TOE_K2));
}

export function okToSt(cusp) {
	const l = cusp[0],
		c = cusp[1];

	cusp[0] = c / l;
	cusp[1] = c / (1 - l);
}

export function okComputeMaxSaturation(a, b) {
	let k0, k1, k2, k3, k4, wl, wm, ws;

	if (OK_GAMUT_RGB_COEFFS[0][0][0] * a + OK_GAMUT_RGB_COEFFS[0][0][1] * b > 1) {
		[k0, k1, k2, k3, k4] = OK_GAMUT_RGB_COEFFS[0][1];

		wl = LMS_TO_SRGB_LINEAR_MATRIX[0];
		wm = LMS_TO_SRGB_LINEAR_MATRIX[1];
		ws = LMS_TO_SRGB_LINEAR_MATRIX[2];
	} else if (OK_GAMUT_RGB_COEFFS[1][0][0] * a + OK_GAMUT_RGB_COEFFS[1][0][1] * b > 1) {
		[k0, k1, k2, k3, k4] = OK_GAMUT_RGB_COEFFS[1][1];

		wl = LMS_TO_SRGB_LINEAR_MATRIX[3];
		wm = LMS_TO_SRGB_LINEAR_MATRIX[4];
		ws = LMS_TO_SRGB_LINEAR_MATRIX[5];
	} else {
		[k0, k1, k2, k3, k4] = OK_GAMUT_RGB_COEFFS[2][1];

		wl = LMS_TO_SRGB_LINEAR_MATRIX[6];
		wm = LMS_TO_SRGB_LINEAR_MATRIX[7];
		ws = LMS_TO_SRGB_LINEAR_MATRIX[8];
	}

	const sat = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

	const kl = OKLAB_TO_LMS_PRIME_MATRIX[1] * a + OKLAB_TO_LMS_PRIME_MATRIX[2] * b,
		km = OKLAB_TO_LMS_PRIME_MATRIX[4] * a + OKLAB_TO_LMS_PRIME_MATRIX[5] * b,
		ks = OKLAB_TO_LMS_PRIME_MATRIX[7] * a + OKLAB_TO_LMS_PRIME_MATRIX[8] * b;

	const l_ = 1 + sat * kl,
		m_ = 1 + sat * km,
		s_ = 1 + sat * ks;

	const l = l_ ** 3,
		m = m_ ** 3,
		s = s_ ** 3;

	const lds = 3 * kl * l_ ** 2,
		mds = 3 * km * m_ ** 2,
		sds = 3 * ks * s_ ** 2;

	const lds2 = 6 * kl * kl * l_,
		mds2 = 6 * km * km * m_,
		sds2 = 6 * ks * ks * s_;

	const f = wl * l + wm * m + ws * s,
		f1 = wl * lds + wm * mds + ws * sds,
		f2 = wl * lds2 + wm * mds2 + ws * sds2;

	return sat - (f * f1) / (f1 * f1 - 0.5 * f * f2);
}

// CAM constants
const K = 1 / (5 * CAM_DEFAULTS.LA + 1),
	K4 = K * K * K * K;

export const CAM_FL = K4 * CAM_DEFAULTS.LA + 0.1 * (1 - K4) * (1 - K4) * Math.cbrt(5 * CAM_DEFAULTS.LA);
export const CAM_FL_ROOT = CAM_FL ** 0.25;

export const CAM_D_FACTOR = clamp(CAM_DEFAULTS.F * (1 - (1 / 3.6) * Math.exp((-CAM_DEFAULTS.LA - 42) / 92)), 0, 1);

export const CAM_WHITEPOINT = WHITEPOINT_D65.map(c => c * 100);

const CAM16_WHITEPOINT = matmul([0, 0, 0], CAT16_MATRIX, CAM_WHITEPOINT[0], CAM_WHITEPOINT[1], CAM_WHITEPOINT[2]);

export const CAM16_D_RGB = CAM16_WHITEPOINT.map(c => 1 + CAM_D_FACTOR * (CAM_WHITEPOINT[1] / c - 1));
export const CAM16_D_RGB_INV = CAM16_D_RGB.map(c => 1 / c);

export const CAM16_RGB_CW = CAM16_WHITEPOINT.map((c, i) => c * CAM16_D_RGB[i]);
export const CAM16_RGB_AW = camAdapt([0, 0, 0], CAM16_RGB_CW[0], CAM16_RGB_CW[1], CAM16_RGB_CW[2], CAM_FL);

export const CAM02_LCD_C1 = 0.007;
export const CAM02_LCD_C2 = 0.0053;

export const CAM02_SCD_C1 = 0.007;
export const CAM02_SCD_C2 = 0.0363;

export const CAM_N = CAM_DEFAULTS.YB / CAM_WHITEPOINT[1];
export const CAM_Z = 1.48 + Math.sqrt(CAM_N);
export const CAM_NBB = 0.725 * CAM_N ** -0.2;
export const CAM_NCB = CAM_NBB;
