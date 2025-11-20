import { alloc3, free3 } from "../pool.js";
import { clamp, LMS_TO_XYZ_HPE_MATRIX, matmul, XYZ_TO_LMS_HPE_MATRIX } from "../utils.js";

export default {
	name: "DKL (HPE)",
	long: "Derrington-Krauskopf-Lennie Opponent Space (DKL)",
	css: "dkl",
	lossy: true,
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
			rg = (l - m) / 1.56,
			by = (l + m - 2 * s) / 1.88;

		out.lum = clamp(lum, 0, 1, unclamped);
		out.rg = clamp(rg / 2 + 0.5, 0, 1, unclamped);
		out.by = clamp(by / 2 + 0.5, 0, 1, unclamped);

		return out;
	},
};
