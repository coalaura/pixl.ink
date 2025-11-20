import { clamp, EPS_PRECISION } from "../utils.js";

export default {
	name: "CIE xyY",
	long: "CIE 1931 xyY Chromaticity-Luminance",
	css: "xyy",
	unbounded: true,
	tags: ["fundamental", "chromaticity"],
	base: "CIE 1931 XYZ",
	ui: {
		x: { from: 0, to: 1, step: 0.001, round: 3, name: "x" },
		y: { from: 0, to: 1, step: 0.001, round: 3, name: "y" },
		Y: { from: 0, to: 1, step: 0.001, round: 3, name: "Luminance", primary: true },
	},

	from: (xyY, out = {}) => {
		const x = xyY.x,
			y = xyY.y;

		if (y < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		out.y = xyY.Y;

		out.x = (x * out.y) / y;
		out.z = ((1 - x - y) * out.y) / y;

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const X = xyz.x,
			Y = xyz.y,
			Z = xyz.z;

		const sum = X + Y + Z;

		if (sum < EPS_PRECISION) {
			out.x = 0.3127;
			out.y = 0.329;
			out.Y = 0;

			return out;
		}

		out.x = X / sum;
		out.y = Y / sum;
		out.Y = clamp(Y, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { x: 0.3127, y: 0.329, Y: 0.0 },
		"#FFFFFF": { x: 0.3127, y: 0.329, Y: 1.0 },
		"#FF0000": { x: 0.64, y: 0.33, Y: 0.2126 },
		"#00FF00": { x: 0.3, y: 0.6, Y: 0.7152 },
		"#0000FF": { x: 0.15, y: 0.06, Y: 0.0722 },
		"#FFFF00": { x: 0.4193, y: 0.5053, Y: 0.9278 },
		"#00FFFF": { x: 0.2246, y: 0.3287, Y: 0.7874 },
		"#FF00FF": { x: 0.3209, y: 0.1542, Y: 0.2848 },
		"#808080": { x: 0.3127, y: 0.329, Y: 0.2159 },
		"#FFA500": { x: 0.5005, y: 0.4408, Y: 0.4817 },
	},
};
