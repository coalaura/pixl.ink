import { alloc3, free3 } from "../pool.js";
import { clamp, makeMatrixPair, matmul, pow_sign } from "../utils.js";

const [XYZ_TO_LMS_MATRIX, LMS_TO_XYZ_MATRIX] = makeMatrixPair([
	[2.968, 2.741, -0.649],
	[1.237, 5.969, -0.173],
	[-0.318, 0.387, 2.311],
]);

const [LMSP_TO_IGPGTG_MATRIX, IGPgTg_TO_LMSP_MATRIX] = makeMatrixPair([
	[0.117, 1.464, 0.13],
	[8.285, -8.361, 21.4],
	[-1.208, 2.412, -36.53],
]);

const LMS_SCALE = [18.36, 21.46, 19435],
	GAMMA = 0.427,
	INV_GAMMA = 1 / GAMMA;

function lmsToLmsp(lms) {
	lms[0] = pow_sign(lms[0] / LMS_SCALE[0], GAMMA);
	lms[1] = pow_sign(lms[1] / LMS_SCALE[1], GAMMA);
	lms[2] = pow_sign(lms[2] / LMS_SCALE[2], GAMMA);
}

function lmspToLms(lmsp) {
	lmsp[0] = pow_sign(lmsp[0], INV_GAMMA) * LMS_SCALE[0];
	lmsp[1] = pow_sign(lmsp[1], INV_GAMMA) * LMS_SCALE[1];
	lmsp[2] = pow_sign(lmsp[2], INV_GAMMA) * LMS_SCALE[2];
}

export default {
	name: "IgPgTg",
	long: "IgPgTg - Hue-linear Color Space (Hellwig & Fairchild, 2020)",
	css: "igpgtg",
	tags: ["opponent_space", "perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		Ig: { from: 0, to: 1, step: 0.001, round: 3, name: "Intensity Ig", primary: true },
		Pg: { from: -1, to: 1, step: 0.001, round: 3, name: "Protan Pg" },
		Tg: { from: -1, to: 1, step: 0.001, round: 3, name: "Tritan Tg" },
	},

	from: (igpgtg, out = {}) => {
		const IG = igpgtg.Ig,
			PG = (igpgtg.Pg - 0.5) * 2,
			TG = (igpgtg.Tg - 0.5) * 2;

		const v3 = matmul(alloc3(), IGPgTg_TO_LMSP_MATRIX, IG, PG, TG);

		lmspToLms(v3);

		matmul(v3, LMS_TO_XYZ_MATRIX, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_LMS_MATRIX, xyz.x, xyz.y, xyz.z);

		lmsToLmsp(v3);

		matmul(v3, LMSP_TO_IGPGTG_MATRIX, v3[0], v3[1], v3[2]);

		const IG = v3[0],
			PG = v3[1],
			TG = v3[2];

		free3(v3);

		out.Ig = clamp(IG, 0, 1, unclamped);
		out.Pg = clamp(PG / 2 + 0.5, 0, 1, unclamped);
		out.Tg = clamp(TG / 2 + 0.5, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { Ig: 0.0, Pg: 0.5, Tg: 0.5 },
		"#FFFFFF": { Ig: 0.9741, Pg: 0.5007, Tg: 0.498 },
		"#FF0000": { Ig: 0.5483, Pg: 0.5768, Tg: 0.7184 },
		"#00FF00": { Ig: 0.8197, Pg: 0.3231, Tg: 0.6641 },
		"#0000FF": { Ig: 0.3076, Pg: 0.3651, Tg: 0.2956 },
		"#FFFF00": { Ig: 0.9441, Pg: 0.4289, Tg: 0.6952 },
		"#00FFFF": { Ig: 0.8553, Pg: 0.3868, Tg: 0.4707 },
		"#FF00FF": { Ig: 0.6077, Pg: 0.6952, Tg: 0.3574 },
		"#808080": { Ig: 0.5062, Pg: 0.5004, Tg: 0.499 },
		"#FFA500": { Ig: 0.7324, Pg: 0.5198, Tg: 0.6605 },
	},
};
