import { alloc3, free3 } from "../pool.js";
import { clamp, srgbToXyz, xyzToSrgb } from "../utils.js";

export default {
	name: "sRGB",
	long: "Standard RGB - IEC 61966-2-1 (D65, sRGB TRC)",
	css: "srgb",
	tags: ["device_rgb"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 255, step: 1, round: 0, name: "Red" },
		g: { from: 0, to: 255, step: 1, round: 0, name: "Green" },
		b: { from: 0, to: 255, step: 1, round: 0, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = srgbToXyz(alloc3(), rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	format: rgb => {
		const r = Math.round(rgb.r * 255),
			g = Math.round(rgb.g * 255),
			b = Math.round(rgb.b * 255);

		return `rgb(${r} ${g} ${b})`;
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
		"#808080": { r: 0.502, g: 0.502, b: 0.502 },
		"#FFA500": { r: 1.0, g: 0.6471, b: 0.0 },
	},
};
