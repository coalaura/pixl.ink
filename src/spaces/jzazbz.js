import { alloc3, free3 } from "../pool.js";
import {
	CONE_TO_XYZ_JZAZBZ_MATRIX,
	clamp,
	EPS_PRECISION,
	JZAZBZ_AZBZ_SCALE,
	makeMatrixPair,
	matmul,
	PQ_LUMINANCE_SCALE,
	PQ_P,
	PQ_P_INV,
	PRE_ADAPT_B,
	PRE_ADAPT_G,
	pqDecodeST2084,
	pqEncodeST2084,
	XYZ_TO_CONE_JZAZBZ_MATRIX,
} from "../utils.js";

const D = -0.56,
	D0 = 1.6295499532821566e-11;

const [CONE_TO_IAB_MATRIX, IAB_TO_CONE_MATRIX] = makeMatrixPair([
	[0.5, 0.5, 0.0],
	[3.524, -4.066708, 0.542708],
	[0.199076, 1.096799, -1.295875],
]);

export default {
	name: "JzAzBz",
	long: "JzAzBz - Perceptual HDR Uniform Color Space (Safdar et al.)",
	css: "jzazbz",
	tags: ["perceptual_uniform", "hdr"],
	base: "CIE 1931 XYZ",
	ui: {
		Jz: { from: 0, to: 1, step: 0.001, round: 3, name: "Jz", primary: true },
		Az: { from: -0.21, to: 0.21, step: 0.001, round: 3, name: "Az" },
		Bz: { from: -0.21, to: 0.21, step: 0.001, round: 3, name: "Bz" },
	},

	from: (jab, out = {}) => {
		const Az_i = (jab.Az - 0.5) * JZAZBZ_AZBZ_SCALE,
			Bz_i = (jab.Bz - 0.5) * JZAZBZ_AZBZ_SCALE;

		const Jz_raw = jab.Jz;

		const Iz_num = Jz_raw + D0,
			Iz_den = 1 + D - D * (Jz_raw + D0),
			Iz = Math.abs(Iz_den) < EPS_PRECISION ? 0 : Iz_num / Iz_den;

		const v3 = matmul(alloc3(), IAB_TO_CONE_MATRIX, Iz, Az_i, Bz_i);

		v3[0] = pqDecodeST2084(v3[0], PQ_P_INV) / PQ_LUMINANCE_SCALE;
		v3[1] = pqDecodeST2084(v3[1], PQ_P_INV) / PQ_LUMINANCE_SCALE;
		v3[2] = pqDecodeST2084(v3[2], PQ_P_INV) / PQ_LUMINANCE_SCALE;

		matmul(v3, CONE_TO_XYZ_JZAZBZ_MATRIX, v3[0], v3[1], v3[2]);

		out.z = v3[2];
		out.x = (v3[0] + (PRE_ADAPT_B - 1) * out.z) / PRE_ADAPT_B;
		out.y = (v3[1] + (PRE_ADAPT_G - 1) * out.x) / PRE_ADAPT_G;

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const xAdapt = PRE_ADAPT_B * xyz.x - (PRE_ADAPT_B - 1) * xyz.z,
			yAdapt = PRE_ADAPT_G * xyz.y - (PRE_ADAPT_G - 1) * xyz.x,
			zAdapt = xyz.z;

		const v3 = matmul(alloc3(), XYZ_TO_CONE_JZAZBZ_MATRIX, xAdapt, yAdapt, zAdapt);

		v3[0] = pqEncodeST2084(v3[0] * PQ_LUMINANCE_SCALE, PQ_P);
		v3[1] = pqEncodeST2084(v3[1] * PQ_LUMINANCE_SCALE, PQ_P);
		v3[2] = pqEncodeST2084(v3[2] * PQ_LUMINANCE_SCALE, PQ_P);

		matmul(v3, CONE_TO_IAB_MATRIX, v3[0], v3[1], v3[2]);

		const Iz = v3[0],
			Az_i = v3[1],
			Bz_i = v3[2];

		free3(v3);

		const Jz_raw_num = (1 + D) * Iz,
			Jz_raw_den = 1 + D * Iz,
			Jz_raw = Math.abs(Jz_raw_den) < EPS_PRECISION ? 0 : Jz_raw_num / Jz_raw_den - D0;

		const Jz_scaled = Jz_raw,
			Az_scaled = Az_i / JZAZBZ_AZBZ_SCALE + 0.5,
			Bz_scaled = Bz_i / JZAZBZ_AZBZ_SCALE + 0.5;

		out.Jz = clamp(Jz_scaled, 0, 1, unclamped);
		out.Az = clamp(Az_scaled, 0, 1, unclamped);
		out.Bz = clamp(Bz_scaled, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { Jz: 0.0, Az: 0.5, Bz: 0.5 },
		"#FFFFFF": { Jz: 0.2221, Az: 0.4996, Bz: 0.4997 },
		"#FF0000": { Jz: 0.1344, Az: 0.7807, Bz: 0.7664 },
		"#00FF00": { Jz: 0.1768, Az: 0.2404, Bz: 0.7833 },
		"#0000FF": { Jz: 0.0958, Az: 0.4027, Bz: 0.0575 },
		"#FFFF00": { Jz: 0.2096, Az: 0.4318, Bz: 0.8209 },
		"#00FFFF": { Jz: 0.1926, Az: 0.3327, Bz: 0.4266 },
		"#FF00FF": { Jz: 0.1584, Az: 0.7629, Bz: 0.2866 },
		"#808080": { Jz: 0.1183, Az: 0.4997, Bz: 0.4998 },
		"#FFA500": { Jz: 0.1694, Az: 0.5743, Bz: 0.7931 },
	},
};
