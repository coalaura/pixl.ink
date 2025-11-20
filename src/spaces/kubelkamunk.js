import { alloc3, free3 } from "../pool.js";
import { clamp, linearRgbToXyz, xyzToLinearRgb } from "../utils.js";

const R_MIN = 1e-4,
	MAX_UI_KS = 4;

export default {
	name: "Kubelka-Munk",
	long: "Kubelka-Munk (K/S) derived from Linear sRGB",
	css: "kubelka-munk",
	tags: ["experimental_model", "transfer_encoding"],
	base: "Linear sRGB",
	unbounded: true,
	ui: {
		kr: { from: 0, to: MAX_UI_KS, step: 0.01, round: 2, name: "Absorption R (K/S)" },
		kg: { from: 0, to: MAX_UI_KS, step: 0.01, round: 2, name: "Absorption G (K/S)" },
		kb: { from: 0, to: MAX_UI_KS, step: 0.01, round: 2, name: "Absorption B (K/S)" },
	},

	from: (km, out = {}) => {
		const kr = Math.max(0, km.kr * MAX_UI_KS),
			kg = Math.max(0, km.kg * MAX_UI_KS),
			kb = Math.max(0, km.kb * MAX_UI_KS);

		const r = 1 / (1 + kr + Math.sqrt(kr * (kr + 2))),
			g = 1 / (1 + kg + Math.sqrt(kg * (kg + 2))),
			b = 1 / (1 + kb + Math.sqrt(kb * (kb + 2)));

		const v3 = linearRgbToXyz(alloc3(), r, g, b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToLinearRgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const r = clamp(v3[0], R_MIN, 1.0),
			g = clamp(v3[1], R_MIN, 1.0),
			b = clamp(v3[2], R_MIN, 1.0);

		free3(v3);

		const kr = (1 - r) ** 2 / (2 * r),
			kg = (1 - g) ** 2 / (2 * g),
			kb = (1 - b) ** 2 / (2 * b);

		out.kr = clamp(kr / MAX_UI_KS, 0, 1, unclamped);
		out.kg = clamp(kg / MAX_UI_KS, 0, 1, unclamped);
		out.kb = clamp(kb / MAX_UI_KS, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { kr: 1249.75, kg: 1249.75, kb: 1249.75 },
		"#FFFFFF": { kr: 0.0, kg: 0.0, kb: 0.0 },
		"#FF0000": { kr: 0.0, kg: 1249.75, kb: 1249.75 },
		"#00FF00": { kr: 1249.75, kg: 0.0, kb: 1249.75 },
		"#0000FF": { kr: 1249.75, kg: 1249.75, kb: 0.0 },
		"#FFFF00": { kr: 0.0, kg: 0.0, kb: 1249.75 },
		"#00FFFF": { kr: 1249.75, kg: 0.0, kb: 0.0 },
		"#FF00FF": { kr: 0.0, kg: 1249.75, kb: 0.0 },
		"#808080": { kr: 0.3561, kg: 0.3561, kb: 0.3561 },
		"#FFA500": { kr: 0.0, kg: 0.1292, kb: 1249.75 },
	},
};
