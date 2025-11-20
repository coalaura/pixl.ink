import { alloc3, free3 } from "../pool.js";
import { clamp, LMS_TO_XYZ_HPE_MATRIX, matmul, XYZ_TO_LMS_HPE_MATRIX } from "../utils.js";

export default {
	name: "LMS",
	long: "LMS Cone Excitations (Hunt-Pointer-Estevez Transform)",
	css: "lms",
	unbounded: true,
	tags: ["fundamental", "opponent_space"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 1, step: 0.001, round: 3, name: "L (Long)" },
		m: { from: 0, to: 1, step: 0.001, round: 3, name: "M (Medium)" },
		s: { from: 0, to: 1, step: 0.001, round: 3, name: "S (Short)" },
	},

	from: (lms, out = {}) => {
		const v3 = matmul(alloc3(), LMS_TO_XYZ_HPE_MATRIX, lms.l, lms.m, lms.s);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LMS_HPE_MATRIX, xyz.x, xyz.y, xyz.z);

		out.l = clamp(v3[0], 0, 1, unclamped);
		out.m = clamp(v3[1], 0, 1, unclamped);
		out.s = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, m: 0.0, s: 0.0 },
		"#FFFFFF": { l: 0.9737, m: 1.0155, s: 1.0891 },
		"#FF0000": { l: 0.3057, m: 0.1578, s: 0.0193 },
		"#00FF00": { l: 0.6227, m: 0.7697, s: 0.1192 },
		"#0000FF": { l: 0.0453, m: 0.0881, s: 0.9505 },
		"#FFFF00": { l: 0.9284, m: 0.9274, s: 0.1385 },
		"#00FFFF": { l: 0.668, m: 0.8578, s: 1.0697 },
		"#FF00FF": { l: 0.351, m: 0.2458, s: 0.9699 },
		"#808080": { l: 0.2102, m: 0.2192, s: 0.2351 },
		"#FFA500": { l: 0.54, m: 0.4474, s: 0.0642 },
	},
};
