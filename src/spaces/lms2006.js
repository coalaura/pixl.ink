import { alloc3, free3 } from "../pool.js";
import { clamp, matmul, XYZ_TO_LMS_2006_MATRIX, LMS_2006_TO_XYZ_MATRIX } from "../utils.js";

export default {
	name: "LMS (Stockman)",
	long: "LMS Cone Excitations (Stockman & Sharpe 2006)",
	css: "lms-stockman",
	unbounded: true,
	tags: ["fundamental", "opponent_space"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 1, step: 0.001, round: 3, name: "L (Long)" },
		m: { from: 0, to: 1, step: 0.001, round: 3, name: "M (Medium)" },
		s: { from: 0, to: 1, step: 0.001, round: 3, name: "S (Short)" },
	},

	from: (lms, out = {}) => {
		const v3 = matmul(alloc3(), LMS_2006_TO_XYZ_MATRIX, lms.l, lms.m, lms.s);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LMS_2006_MATRIX, xyz.x, xyz.y, xyz.z);

		out.l = clamp(v3[0], 0, 1, unclamped);
		out.m = clamp(v3[1], 0, 1, unclamped);
		out.s = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, m: 0.0, s: 0.0 },
		"#FFFFFF": { l: 0.7338, m: 0.317, s: 0.0214 },
		"#FF0000": { l: 0.2001, m: 0.0315, s: 0.0001 },
		"#00FF00": { l: 0.481, m: 0.2464, s: 0.0013 },
		"#0000FF": { l: 0.0527, m: 0.0391, s: 0.02 },
		"#FFFF00": { l: 0.6811, m: 0.2779, s: 0.0014 },
		"#00FFFF": { l: 0.5337, m: 0.2855, s: 0.0213 },
		"#FF00FF": { l: 0.2528, m: 0.0706, s: 0.0201 },
		"#808080": { l: 0.1584, m: 0.0684, s: 0.0046 },
		"#FFA500": { l: 0.3827, m: 0.1242, s: 0.0005 },
	},
};
