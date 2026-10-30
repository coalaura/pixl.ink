import { alloc3, free3 } from "../pool.js";
import { clamp, LMS_TO_XYZ_HPE_MATRIX, matmul, XYZ_TO_LMS_HPE_MATRIX } from "../utils.js";

export default {
	name: "DKL (HPE)",
	long: "Derrington-Krauskopf-Lennie Opponent Space (DKL)",
	css: "dkl",
	tags: ["opponent_space", "experimental_model"],
	base: "LMS (HPE)",
	ui: {
		lum: { from: 0, to: 1, step: 0.01, round: 2, name: "Luminance", primary: true },
		rg: { from: -1, to: 1, step: 0.01, round: 2, name: "Red-Green" },
		by: { from: -1, to: 1, step: 0.01, round: 2, name: "Blue-Yellow" },
	},

	from: (dkl, out = {}) => {
		const lum = dkl.lum,
			rg = (dkl.rg - 0.5) * 2,
			by = (dkl.by - 0.5) * 2;

		const l = lum + 0.78 * rg - 0.47 * by,
			m = lum - 0.78 * rg + 0.47 * by,
			s = lum + 0.0 * rg + 0.94 * by;

		const v3 = matmul(alloc3(), LMS_TO_XYZ_HPE_MATRIX, l, m, s);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const x = xyz.x,
			y = xyz.y,
			z = xyz.z;

		const v3 = matmul(alloc3(), XYZ_TO_LMS_HPE_MATRIX, x, y, z);

		const l = v3[0],
			m = v3[1],
			s = v3[2];

		free3(v3);

		const lum = (l + m) / 2,
			by = (s - lum) / 0.94,
			rg = (l - m + 0.94 * by) / 1.56;

		out.lum = clamp(lum, 0, 1, unclamped);
		out.rg = clamp(rg / 2 + 0.5, 0, 1, unclamped);
		out.by = clamp(by / 2 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { lum: 0, rg: 0.5, by: 0.5 },
		"#FFFFFF": { lum: 0.99459, rg: 0.516591, by: 0.549824 },
		"#FF0000": { lum: 0.231595, rg: 0.47935, by: 0.387087 },
		"#00FF00": { lum: 0.696379, rg: 0.267896, by: 0.193004 },
		"#0000FF": { lum: 0.066615, rg: 0.769344, by: 0.969733 },
		"#FFFF00": { lum: 0.927974, rg: 0.247246, by: 0.080091 },
		"#00FFFF": { lum: 0.762994, rg: 0.537241, by: 0.662737 },
		"#FF00FF": { lum: 0.298211, rg: 0.748695, by: 0.856821 },
		"#808080": { lum: 0.214693, rg: 0.503581, by: 0.510755 },
		"#FFA500": { lum: 0.493616, rg: 0.392018, by: 0.271576 },
	},
};
