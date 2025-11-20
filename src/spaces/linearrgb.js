import { alloc3, free3 } from "../pool.js";
import { clamp, linearRgbToXyz, round, xyzToLinearRgb } from "../utils.js";

export default {
	name: "Linear sRGB",
	long: "Linear-Light sRGB (Scene-Referred, D65)",
	css: "srgb-linear",
	tags: ["device_rgb"],
	base: "sRGB",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = linearRgbToXyz(alloc3(), rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToLinearRgb(alloc3(), xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	format: rgb => {
		const r = round(rgb.r, 3),
			g = round(rgb.g, 3),
			b = round(rgb.b, 3);

		return `color(srgb-linear ${r} ${g} ${b})`;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 1.0, g: 0.0, b: 0.0 },
		"#00FF00": { r: 0.0, g: 1.0, b: 0.0 },
		"#0000FF": { r: 0.0, g: 0.0, b: 1.0 },
		"#FFFF00": { r: 1.0, g: 1.0, b: 0.0 },
		"#00FFFF": { r: 0.0, g: 1.0, b: 1.0 },
		"#FF00FF": { r: 1.0, g: 0.0, b: 1.0 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2159 },
		"#FFA500": { r: 1.0, g: 0.3763, b: 0.0 },
	},
};
