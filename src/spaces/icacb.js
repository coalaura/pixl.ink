import { alloc3, free3 } from "../pool.js";
import { clamp, HDR_REFERENCE_WHITE_NITS, invert3x3, matmul, optimizeMatrix, pqDecodeST2084, pqEncodeST2084, PQ_MAX_LUMINANCE } from "../utils.js";

const XYZ_TO_LMS_MATRIX = optimizeMatrix([
	[0.37613, 0.70431, -0.05675],
	[-0.21649, 1.14744, 0.05356],
	[0.02567, 0.16713, 0.74235],
]);
const LMS_TO_ICACB_MATRIX = optimizeMatrix([
	[0.4949, 0.5037, 0.0015],
	[4.2854, -4.5462, 0.2609],
	[0.3605, 1.1499, -1.5105],
]);
const LMS_TO_XYZ_MATRIX = invert3x3(XYZ_TO_LMS_MATRIX),
	ICACB_TO_LMS_MATRIX = invert3x3(LMS_TO_ICACB_MATRIX),
	PQ_SCALE = HDR_REFERENCE_WHITE_NITS / PQ_MAX_LUMINANCE;

export const shaderConstants = {
	ICACB_XYZ_TO_LMS_MATRIX: XYZ_TO_LMS_MATRIX,
	ICACB_LMS_TO_XYZ_MATRIX: LMS_TO_XYZ_MATRIX,
	ICACB_LMS_TO_OPPONENT_MATRIX: LMS_TO_ICACB_MATRIX,
	ICACB_OPPONENT_TO_LMS_MATRIX: ICACB_TO_LMS_MATRIX,
};

export default {
	name: "ICaCb",
	long: "ICaCb (PQ-Based HDR Opponent Space)",
	css: "icacb",
	tags: ["opponent_space", "hdr"],
	base: "CIE 1931 XYZ",
	ui: {
		I: { from: 0, to: 1, step: 0.001, round: 3, name: "Intensity", primary: true },
		Ca: { from: -0.5, to: 0.5, step: 0.001, round: 3, name: "Chroma a" },
		Cb: { from: -0.5, to: 0.5, step: 0.001, round: 3, name: "Chroma b" },
	},

	from: (icacb, out = {}) => {
		const I = icacb.I,
			CaN = icacb.Ca - 0.5,
			CbN = icacb.Cb - 0.5;

		const v3 = matmul(alloc3(), ICACB_TO_LMS_MATRIX, I, CaN, CbN);

		v3[0] = pqDecodeST2084(v3[0]) / PQ_SCALE;
		v3[1] = pqDecodeST2084(v3[1]) / PQ_SCALE;
		v3[2] = pqDecodeST2084(v3[2]) / PQ_SCALE;

		matmul(v3, LMS_TO_XYZ_MATRIX, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LMS_MATRIX, xyz.x, xyz.y, xyz.z);

		v3[0] = pqEncodeST2084(v3[0] * PQ_SCALE);
		v3[1] = pqEncodeST2084(v3[1] * PQ_SCALE);
		v3[2] = pqEncodeST2084(v3[2] * PQ_SCALE);

		matmul(v3, LMS_TO_ICACB_MATRIX, v3[0], v3[1], v3[2]);

		const I = v3[0],
			Ca = v3[1],
			Cb = v3[2];

		free3(v3);

		out.I = clamp(I, 0, 1, unclamped);
		out.Ca = clamp(Ca + 0.5, 0, 1, unclamped);
		out.Cb = clamp(Cb + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { I: 0.000001, Ca: 0.5, Cb: 0.5 },
		"#FFFFFF": { I: 0.580745, Ca: 0.499998, Cb: 0.500039 },
		"#FF0000": { I: 0.428562, Ca: 0.747729, Cb: 0.645727 },
		"#00FF00": { I: 0.541976, Ca: 0.392791, Cb: 0.678477 },
		"#0000FF": { I: 0.338067, Ca: 0.413993, Cb: 0.196392 },
		"#FFFF00": { I: 0.571876, Ca: 0.483547, Cb: 0.680286 },
		"#00FFFF": { I: 0.553316, Ca: 0.417755, Cb: 0.476111 },
		"#FF00FF": { I: 0.460519, Ca: 0.689915, Cb: 0.342197 },
		"#808080": { I: 0.427855, Ca: 0.499989, Cb: 0.500045 },
		"#FFA500": { I: 0.506701, Ca: 0.563344, Cb: 0.669083 },
	},
};
