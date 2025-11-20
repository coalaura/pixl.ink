import { alloc3, free3 } from "../pool.js";
import { clamp, invert3x3, matmul, matmul3x3, optimizeMatrix, WHITEPOINT_D65 } from "../utils.js";

const XYZ_TO_LMS_2006 = optimizeMatrix([
	[0.185082982238733, 0.584081279463687, -0.0240722415044404],
	[-0.134433056469973, 0.405752392775348, 0.0358252602217631],
	[0.000789456671966863, -0.000912281325916184, 0.0198490812339463],
]);

const [L_w, M_w, S_w] = matmul([0, 0, 0], XYZ_TO_LMS_2006, WHITEPOINT_D65[0], WHITEPOINT_D65[1], WHITEPOINT_D65[2]);

const mc1 = L_w / M_w,
	mc2 = (L_w + M_w) / S_w;

const LMS_TO_DKL = optimizeMatrix([
	[1, 1, 0],
	[1, -mc1, 0],
	[-1, -1, mc2],
]);

const XYZ_TO_DKL_MATRIX = matmul3x3(LMS_TO_DKL, XYZ_TO_LMS_2006),
	DKL_TO_XYZ_MATRIX = invert3x3(XYZ_TO_DKL_MATRIX);

export default {
	name: "DKL (Stockman)",
	long: "DKL Opponent Space (Stockman & Sharpe 2006)",
	css: "dkl-stockman",
	lossy: true,
	tags: ["opponent_space", "experimental_model"],
	base: "LMS (Stockman '06)",
	ui: {
		lum: { from: 0, to: 1, step: 0.01, round: 2, name: "Luminance", primary: true },
		rg: { from: -1, to: 1, step: 0.01, round: 2, name: "Red-Green" },
		by: { from: -1, to: 1, step: 0.01, round: 2, name: "Blue-Yellow" },
	},

	from: (dkl, out = {}) => {
		const lum = dkl.lum,
			rg = (dkl.rg - 0.5) * 2,
			by = (dkl.by - 0.5) * 2;

		const v3 = matmul(alloc3(), DKL_TO_XYZ_MATRIX, lum, rg, by);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_DKL_MATRIX, xyz.x, xyz.y, xyz.z);

		const lum = v3[0],
			rg = v3[1],
			by = v3[2];

		free3(v3);

		out.lum = clamp(lum, 0, 1, unclamped);
		out.rg = clamp(rg / 2 + 0.5, 0, 1, unclamped);
		out.by = clamp(by / 2 + 0.5, 0, 1, unclamped);

		return out;
	},
};
