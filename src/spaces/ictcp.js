import { alloc3, free3 } from "../pool.js";
import {
	clamp,
	EPS_PRECISION,
	HDR_REFERENCE_WHITE_NITS,
	IPT_TO_LMS_BT2100_MATRIX,
	LMS_TO_IPT_BT2100_MATRIX,
	LMS_TO_XYZ_BT2100_IPT_MATRIX,
	matmul,
	PQ_C1,
	PQ_C2,
	PQ_C3,
	PQ_M1,
	PQ_M1_INV,
	PQ_M2,
	PQ_M2_INV,
	PQ_MAX_LUMINANCE,
	XYZ_TO_LMS_BT2100_IPT_MATRIX,
} from "../utils.js";

function pqEncode(l) {
	if (l < EPS_PRECISION) {
		return 0;
	}

	const p = (l / PQ_MAX_LUMINANCE) ** PQ_M1;

	return ((PQ_C1 + PQ_C2 * p) / (1 + PQ_C3 * p)) ** PQ_M2;
}

function pqDecode(v) {
	if (v < EPS_PRECISION) {
		return 0;
	}

	const n = Math.max(v ** PQ_M2_INV - PQ_C1, 0),
		d = PQ_C2 - PQ_C3 * v ** PQ_M2_INV;

	return PQ_MAX_LUMINANCE * (n / d) ** PQ_M1_INV;
}

export default {
	name: "ICtCp",
	long: "ICtCp (ITU-R BT.2100 HDR Opponent Space; PQ)",
	css: "ictcp",
	tags: ["opponent_space", "hdr"],
	base: "IPT / BT.2100",
	ui: {
		I: { from: 0, to: 1, step: 0.001, round: 3, name: "Intensity", primary: true },
		Ct: { from: -0.5, to: 0.5, step: 0.001, round: 3, name: "Chroma T" },
		Cp: { from: -0.5, to: 0.5, step: 0.001, round: 3, name: "Chroma P" },
	},

	from: (ictcp, out = {}) => {
		const v3 = matmul(alloc3(), IPT_TO_LMS_BT2100_MATRIX, ictcp.I, ictcp.Ct - 0.5, ictcp.Cp - 0.5);

		v3[0] = pqDecode(v3[0]) / HDR_REFERENCE_WHITE_NITS;
		v3[1] = pqDecode(v3[1]) / HDR_REFERENCE_WHITE_NITS;
		v3[2] = pqDecode(v3[2]) / HDR_REFERENCE_WHITE_NITS;

		matmul(v3, LMS_TO_XYZ_BT2100_IPT_MATRIX, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LMS_BT2100_IPT_MATRIX, xyz.x * HDR_REFERENCE_WHITE_NITS, xyz.y * HDR_REFERENCE_WHITE_NITS, xyz.z * HDR_REFERENCE_WHITE_NITS);

		v3[0] = pqEncode(v3[0]);
		v3[1] = pqEncode(v3[1]);
		v3[2] = pqEncode(v3[2]);

		matmul(v3, LMS_TO_IPT_BT2100_MATRIX, v3[0], v3[1], v3[2]);

		const I = v3[0],
			Ct = v3[1],
			Cp = v3[2];

		free3(v3);

		out.I = clamp(I, 0, 1, unclamped);
		out.Ct = clamp(Ct + 0.5, 0, 1, unclamped);
		out.Cp = clamp(Cp + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { I: 0.0, Ct: 0.5, Cp: 0.5 },
		"#FFFFFF": { I: 0.5807, Ct: 0.5, Cp: 0.5 },
		"#FF0000": { I: 0.4279, Ct: 0.3843, Cp: 0.7787 },
		"#00FF00": { I: 0.5398, Ct: 0.2188, Cp: 0.4505 },
		"#0000FF": { I: 0.356, Ct: 0.7693, Cp: 0.3386 },
		"#FFFF00": { I: 0.5698, Ct: 0.2483, Cp: 0.5379 },
		"#00FFFF": { I: 0.5537, Ct: 0.4938, Cp: 0.4165 },
		"#FF00FF": { I: 0.4657, Ct: 0.7439, Cp: 0.6228 },
		"#808080": { I: 0.4278, Ct: 0.5, Cp: 0.5 },
		"#FFA500": { I: 0.505, Ct: 0.292, Cp: 0.6107 },
	},
};
