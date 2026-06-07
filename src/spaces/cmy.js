import { alloc3, free3 } from "../pool.js";
import { clamp, linearToSrgb, round, srgbToXyz, xyzToLinearRgb } from "../utils.js";

export default {
	name: "CMY",
	long: "Cyan-Magenta-Yellow (subtractive complement of sRGB)",
	css: "cmy",
	tags: ["device_rgb"],
	base: "sRGB",
	ui: {
		c: { from: 0, to: 1, step: 0.001, round: 3, name: "Cyan" },
		m: { from: 0, to: 1, step: 0.001, round: 3, name: "Magenta" },
		y: { from: 0, to: 1, step: 0.001, round: 3, name: "Yellow" },
	},

	from: (cmy, out = {}) => {
		const v3 = srgbToXyz(alloc3(), 1 - cmy.c, 1 - cmy.m, 1 - cmy.y);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToLinearRgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const c = 1 - linearToSrgb(v3[0]),
			m = 1 - linearToSrgb(v3[1]),
			y = 1 - linearToSrgb(v3[2]);

		free3(v3);

		out.c = clamp(c, 0, 1, unclamped);
		out.m = clamp(m, 0, 1, unclamped);
		out.y = clamp(y, 0, 1, unclamped);

		return out;
	},

	format: cmy => {
		const c = round(cmy.c * 100, 0),
			m = round(cmy.m * 100, 0),
			y = round(cmy.y * 100, 0);

		return `cmy(${c}% ${m}% ${y}%)`;
	},

	expected: {
		"#000000": { c: 1.0, m: 1.0, y: 1.0 },
		"#FFFFFF": { c: 0.0, m: 0.0, y: 0.0 },
		"#FF0000": { c: 0.0, m: 1.0, y: 1.0 },
		"#00FF00": { c: 1.0, m: 0.0, y: 1.0 },
		"#0000FF": { c: 1.0, m: 1.0, y: 0.0 },
		"#FFFF00": { c: 0.0, m: 0.0, y: 1.0 },
		"#00FFFF": { c: 1.0, m: 0.0, y: 0.0 },
		"#FF00FF": { c: 0.0, m: 1.0, y: 0.0 },
		"#808080": { c: 0.498, m: 0.498, y: 0.498 },
		"#FFA500": { c: 0.0, m: 0.3529, y: 1.0 },
	},
};
