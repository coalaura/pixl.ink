import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, makeMatrixPair, matmul, WHITEPOINT_D65 } from "../utils.js";

const [PROLAB_NUMERATOR_MATRIX, PROLAB_NUMERATOR_INV_MATRIX] = makeMatrixPair([
	[75.54, 486.66, 167.39],
	[617.72, -595.45, -22.27],
	[48.34, 194.94, -243.28],
]);

const PROLAB_DENOMINATOR_VECTOR = [0.7554, 3.8666, 1.6739];

function xyzRelToProLabNative(out, r, g, b) {
	matmul(out, PROLAB_NUMERATOR_MATRIX, r, g, b);

	const d = PROLAB_DENOMINATOR_VECTOR[0] * r + PROLAB_DENOMINATOR_VECTOR[1] * g + PROLAB_DENOMINATOR_VECTOR[2] * b + 1;

	const invd = Math.abs(d) < EPS_PRECISION ? 0 : 1 / d;

	out[0] *= invd;
	out[1] *= invd;
	out[2] *= invd;

	return out;
}

function proLabNativeToXyzRel(out, L, a, b) {
	matmul(out, PROLAB_NUMERATOR_INV_MATRIX, L, a, b);

	const x4 = 1 - (PROLAB_DENOMINATOR_VECTOR[0] * out[0] + PROLAB_DENOMINATOR_VECTOR[1] * out[1] + PROLAB_DENOMINATOR_VECTOR[2] * out[2]);

	const invx4 = Math.abs(x4) < EPS_PRECISION ? 0 : 1 / x4;

	out[0] *= invx4;
	out[1] *= invx4;
	out[2] *= invx4;

	return out;
}

export default {
	name: "ProLab",
	long: "ProLab - Perceptually Uniform Projective Lab (D65/2°), Konovalenko et al.",
	css: "prolab",
	tags: ["perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L", primary: true },
		a: { from: -160, to: 160, step: 1, round: 0, name: "a" },
		b: { from: -160, to: 160, step: 1, round: 0, name: "b" },
	},

	from: (pro, out = {}) => {
		const L = (pro.l || 0) * 100,
			a = ((pro.a || 0) - 0.5) * 320,
			b = ((pro.b || 0) - 0.5) * 320;

		const v3 = proLabNativeToXyzRel(alloc3(), L, a, b);

		out.x = v3[0] * WHITEPOINT_D65[0];
		out.y = v3[1] * WHITEPOINT_D65[1];
		out.z = v3[2] * WHITEPOINT_D65[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const r = WHITEPOINT_D65[0] > 0 ? xyz.x / WHITEPOINT_D65[0] : 0,
			g = WHITEPOINT_D65[1] > 0 ? xyz.y / WHITEPOINT_D65[1] : 0,
			b = WHITEPOINT_D65[2] > 0 ? xyz.z / WHITEPOINT_D65[2] : 0;

		const v3 = xyzRelToProLabNative(alloc3(), r, g, b);

		const Ln = v3[0] / 100,
			an = v3[1] / (2 * 160) + 0.5,
			bn = v3[2] / (2 * 160) + 0.5;

		free3(v3);

		out.l = clamp(Ln, 0, 1, unclamped);
		out.a = clamp(an, 0, 1, unclamped);
		out.b = clamp(bn, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.6388, a: 0.7022, b: 0.5833 },
		"#00FF00": { l: 0.9327, a: 0.3554, b: 0.5967 },
		"#0000FF": { l: 0.6783, a: 0.5595, b: 0.2951 },
		"#FFFF00": { l: 0.9867, a: 0.4683, b: 0.6092 },
		"#00FFFF": { l: 0.9652, a: 0.428, b: 0.4703 },
		"#FF00FF": { l: 0.824, a: 0.6506, b: 0.3992 },
		"#808080": { l: 0.6676, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.8474, a: 0.5619, b: 0.5988 },
	},
};
