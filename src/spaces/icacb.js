import { alloc3, free3 } from "../pool.js";
import { clamp, hlgDecode, hlgEncode, IPT_TO_LMS_BT2100_MATRIX, LMS_TO_IPT_BT2100_MATRIX, LMS_TO_XYZ_BT2100_IPT_MATRIX, matmul, XYZ_TO_LMS_BT2100_IPT_MATRIX } from "../utils.js";

export default {
	name: "ICaCb",
	long: "ICaCb (ITU-R BT.2100 HDR Opponent Space; HLG)",
	css: "icacb",
	tags: ["opponent_space", "hdr"],
	base: "IPT / BT.2100",
	ui: {
		I: { from: 0, to: 1, step: 0.001, round: 3, name: "Intensity", primary: true },
		Ca: { from: -0.5, to: 0.5, step: 0.001, round: 3, name: "Chroma a" },
		Cb: { from: -0.5, to: 0.5, step: 0.001, round: 3, name: "Chroma b" },
	},

	from: (icacb, out = {}) => {
		const I = icacb.I,
			CaN = icacb.Ca - 0.5,
			CbN = icacb.Cb - 0.5;

		const v3 = matmul(alloc3(), IPT_TO_LMS_BT2100_MATRIX, I, CaN, CbN);

		v3[0] = hlgDecode(v3[0]);
		v3[1] = hlgDecode(v3[1]);
		v3[2] = hlgDecode(v3[2]);

		matmul(v3, LMS_TO_XYZ_BT2100_IPT_MATRIX, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LMS_BT2100_IPT_MATRIX, xyz.x, xyz.y, xyz.z);

		v3[0] = hlgEncode(v3[0]);
		v3[1] = hlgEncode(v3[1]);
		v3[2] = hlgEncode(v3[2]);

		matmul(v3, LMS_TO_IPT_BT2100_MATRIX, v3[0], v3[1], v3[2]);

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
		"#000000": { I: 0.0, Ca: 0.5, Cb: 0.5 },
		"#FFFFFF": { I: 1.0, Ca: 0.5, Cb: 0.5 },
		"#FF0000": { I: 0.7072, Ca: 0.1635, Cb: 1.1056 },
		"#00FF00": { I: 0.9271, Ca: -0.0559, Cb: 0.414 },
		"#0000FF": { I: 0.5361, Ca: 1.0147, Cb: 0.0741 },
		"#FFFF00": { I: 0.9809, Ca: 0.0123, Cb: 0.5703 },
		"#00FFFF": { I: 0.9521, Ca: 0.4883, Cb: 0.3507 },
		"#FF00FF": { I: 0.7869, Ca: 0.9654, Cb: 0.7457 },
		"#808080": { I: 0.7093, Ca: 0.5, Cb: 0.5 },
		"#FFA500": { I: 0.8629, Ca: 0.0275, Cb: 0.7145 },
	},
};
