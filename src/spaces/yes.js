import { alloc3, free3 } from "../pool.js";
import { clamp, srgbToXyz, xyzToSrgb } from "../utils.js";

const INV_LUMA_DEN = 1 - 0.114,
	KS = 0.114 / INV_LUMA_DEN,
	KE1 = 0.299 / INV_LUMA_DEN;

export default {
	name: "YES",
	long: "YES - Luma and Opponent Channels (Y-E-S)",
	css: "yes",
	tags: ["transfer_encoding", "opponent_space"],
	base: "sRGB",
	ui: {
		y: { from: 0, to: 1, step: 0.01, round: 2, name: "Luminance", primary: true },
		e: { from: 0, to: 1, step: 0.01, round: 2, name: "E (Red-Green)" },
		s: { from: 0, to: 1, step: 0.01, round: 2, name: "S (Yellow-Blue)" },
	},

	from: (yes, out = {}) => {
		const y = yes.y,
			e = (yes.e - 0.5) * 2,
			s = (yes.s - 0.5) * 2;

		const gP = y + KS * s - KE1 * e,
			rP = gP + e,
			bP = y - s;

		const v3 = srgbToXyz(alloc3(), rP, gP, bP);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		v3[0] = clamp(v3[0], 0, 1, unclamped);
		v3[1] = clamp(v3[1], 0, 1, unclamped);
		v3[2] = clamp(v3[2], 0, 1, unclamped);

		const y = 0.299 * v3[0] + 0.587 * v3[1] + 0.114 * v3[2],
			e = (v3[0] - v3[1]) / 2 + 0.5,
			s = (y - v3[2]) / 2 + 0.5;

		free3(v3);

		out.y = clamp(y, 0, 1, unclamped);
		out.e = clamp(e, 0, 1, unclamped);
		out.s = clamp(s, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { y: 0.0, e: 0.5, s: 0.5 },
		"#FFFFFF": { y: 1.0, e: 0.5, s: 0.5 },
		"#FF0000": { y: 0.299, e: 1.0, s: 0.6495 },
		"#00FF00": { y: 0.587, e: 0.0, s: 0.7935 },
		"#0000FF": { y: 0.114, e: 0.5, s: 0.057 },
		"#FFFF00": { y: 0.886, e: 0.5, s: 0.943 },
		"#00FFFF": { y: 0.701, e: 0.0, s: 0.3505 },
		"#FF00FF": { y: 0.413, e: 1.0, s: 0.2065 },
		"#808080": { y: 0.502, e: 0.5, s: 0.5 },
		"#FFA500": { y: 0.679, e: 0.6765, s: 0.8398 },
	},
};
