import { alloc3, free3 } from "../pool.js";
import { clamp, linearRgbToXyz, linearToRec709, rec709ToLinear, xyzToLinearRgb } from "../utils.js";

export default {
	name: "Rec. 709",
	long: "ITU-R BT.709 (Rec. 709) HDTV RGB (D65)",
	css: "rec-709",
	tags: ["device_rgb"],
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

		const v3 = linearRgbToXyz(alloc3(), r, g, b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToLinearRgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const r = linearToRec709(v3[0]),
			g = linearToRec709(v3[1]),
			b = linearToRec709(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
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
		"#808080": { r: 0.4523, g: 0.4523, b: 0.4523 },
		"#FFA500": { r: 1.0, g: 0.6089, b: 0.0 },
	},
};
