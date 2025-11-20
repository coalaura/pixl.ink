import { alloc3, free3 } from "../pool.js";
import { clamp, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "Prismatic",
	long: "Prismatic - Maxwell color triangle with lightness",
	css: "prismatic",
	tags: ["ui_model", "cylindrical_model"],
	base: "sRGB",
	ui: {
		l: { from: 0, to: 1, step: 0.001, round: 3, name: "Lightness", primary: true },
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red proportion" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green proportion" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue proportion" },
	},

	from: (pr, out = {}) => {
		const L = pr.l,
			rp = pr.r,
			gp = pr.g,
			bp = pr.b;

		const mx = Math.max(rp, gp, bp);

		let r = 0,
			g = 0,
			b = 0;

		if (mx !== 0 && L !== 0) {
			const scale = L / mx;

			r = rp * scale;
			g = gp * scale;
			b = bp * scale;
		}

		const xyz = srgbToXyz(alloc3(), r, g, b);

		out.x = xyz[0];
		out.y = xyz[1];
		out.z = xyz[2];

		free3(xyz);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const rgb = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const r = rgb[0],
			g = rgb[1],
			b = rgb[2];

		free3(rgb);

		const L = Math.max(r, g, b);

		const sum = r + g + b;

		let rp = 0,
			gp = 0,
			bp = 0;

		if (sum !== 0) {
			rp = r / sum;
			gp = g / sum;
			bp = b / sum;
		}

		out.l = clamp(L, 0, 1, unclamped);
		out.r = clamp(rp, 0, 1, unclamped);
		out.g = clamp(gp, 0, 1, unclamped);
		out.b = clamp(bp, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { l: 0.0, r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { l: 1.0, r: 0.3333, g: 0.3333, b: 0.3333 },
		"#FF0000": { l: 1.0, r: 1.0, g: 0.0, b: 0.0 },
		"#00FF00": { l: 1.0, r: 0.0, g: 1.0, b: 0.0 },
		"#0000FF": { l: 1.0, r: 0.0, g: 0.0, b: 1.0 },
		"#FFFF00": { l: 1.0, r: 0.5, g: 0.5, b: 0.0 },
		"#00FFFF": { l: 1.0, r: 0.0, g: 0.5, b: 0.5 },
		"#FF00FF": { l: 1.0, r: 0.5, g: 0.0, b: 0.5 },
		"#808080": { l: 0.502, r: 0.3333, g: 0.3333, b: 0.3333 },
		"#FFA500": { l: 1.0, r: 0.6071, g: 0.3929, b: 0.0 },
	},
};
