import { alloc3, free3 } from "../pool.js";
import { clamp, linearToRec709, matmul, REC2020_TO_XYZ_MATRIX, rec709ToLinear, round, XYZ_TO_REC2020_MATRIX } from "../utils.js";

export default {
	name: "Rec. 2020",
	long: "ITU-R BT.2020 (Rec. 2020) Wide-Gamut RGB (D65)",
	css: "rec2020",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r = rec709ToLinear(rgb.r),
			g = rec709ToLinear(rgb.g),
			b = rec709ToLinear(rgb.b);

		const v3 = matmul(alloc3(), REC2020_TO_XYZ_MATRIX, r, g, b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_REC2020_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = linearToRec709(v3[0]),
			g = linearToRec709(v3[1]),
			b = linearToRec709(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	format: r => {
		const R = round(r.r, 3),
			G = round(r.g, 3),
			B = round(r.b, 3);

		return `color(rec2020 ${R} ${G} ${B})`;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.792, g: 0.231, b: 0.0738 },
		"#00FF00": { r: 0.5675, g: 0.9593, b: 0.269 },
		"#0000FF": { r: 0.1684, g: 0.0511, b: 0.9468 },
		"#FFFF00": { r: 0.9783, g: 0.9944, b: 0.2984 },
		"#00FFFF": { r: 0.6057, g: 0.9651, b: 0.9919 },
		"#FF00FF": { r: 0.8192, g: 0.2544, b: 0.9554 },
		"#808080": { r: 0.4521, g: 0.4521, b: 0.4521 },
		"#FFA500": { r: 0.8673, g: 0.6408, b: 0.185 },
	},
};
