import { alloc3, free3 } from "../pool.js";
import { clamp, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "YCoCg",
	long: "YCoCg - Reversible RGB Transform (H.264/AVC Applications)",
	css: "ycocg",
	tags: ["transfer_encoding"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 1, step: 0.01, round: 2, name: "Luma", primary: true },
		Co: { from: 0, to: 1, step: 0.01, round: 2, name: "Co" },
		Cg: { from: 0, to: 1, step: 0.01, round: 2, name: "Cg" },
	},

	from: (ycocg, out = {}) => {
		const y = ycocg.y,
			co = ycocg.Co - 0.5,
			cg = ycocg.Cg - 0.5;

		const rg = y + co - cg,
			gg = y + cg,
			bg = y - co - cg;

		const v3 = srgbToXyz(alloc3(), rg, gg, bg);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const y = 0.25 * v3[0] + 0.5 * v3[1] + 0.25 * v3[2],
			co = 0.5 * v3[0] - 0.5 * v3[2] + 0.5,
			cg = -0.25 * v3[0] + 0.5 * v3[1] - 0.25 * v3[2] + 0.5;

		free3(v3);

		out.y = clamp(y, 0, 1, unclamped);
		out.Co = clamp(co, 0, 1, unclamped);
		out.Cg = clamp(cg, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { y: 0.0, Co: 0.5, Cg: 0.5 },
		"#FFFFFF": { y: 1.0, Co: 0.5, Cg: 0.5 },
		"#FF0000": { y: 0.25, Co: 1.0, Cg: 0.25 },
		"#00FF00": { y: 0.5, Co: 0.5, Cg: 1.0 },
		"#0000FF": { y: 0.25, Co: 0.0, Cg: 0.25 },
		"#FFFF00": { y: 0.75, Co: 1.0, Cg: 0.75 },
		"#00FFFF": { y: 0.75, Co: 0.0, Cg: 0.75 },
		"#FF00FF": { y: 0.5, Co: 0.5, Cg: 0.0 },
		"#808080": { y: 0.502, Co: 0.5, Cg: 0.5 },
		"#FFA500": { y: 0.5735, Co: 1.0, Cg: 0.5735 },
	},
};
