import { clamp, EPS_PRECISION } from "../utils.js";

export default {
	name: "CIE 1960 UCS",
	long: "CIE 1960 Uniform Color Space (u, v, Y)",
	css: "cie-1960-ucs",
	unbounded: true,
	tags: ["fundamental", "chromaticity"],
	base: "CIE 1931 XYZ",
	ui: {
		u: { from: 0, to: 1, step: 0.001, round: 3, name: "u (chromaticity)" },
		v: { from: 0, to: 1, step: 0.001, round: 3, name: "v (chromaticity)" },
		Y: { from: 0, to: 1, step: 0.001, round: 3, name: "Y (Luminance)", primary: true },
	},

	from: (uvy, out = {}) => {
		const u = uvy.u,
			v = uvy.v,
			Y = uvy.Y;

		if (Y < EPS_PRECISION || v < EPS_PRECISION) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const X = (3 * u * Y) / (2 * v),
			Z = Y * ((2 - 0.5 * u) / v - 5);

		out.x = X;
		out.y = Y;
		out.z = Z;

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const X = xyz.x,
			Y = xyz.y,
			Z = xyz.z;

		const denom = X + 15 * Y + 3 * Z;

		if (denom < EPS_PRECISION) {
			out.u = 0;
			out.v = 0;
			out.Y = 0;

			return out;
		}

		const u = (4 * X) / denom,
			v = (6 * Y) / denom;

		out.u = clamp(u, 0, 1, unclamped);
		out.v = clamp(v, 0, 1, unclamped);
		out.Y = clamp(Y, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { u: 0.0, v: 0.0, Y: 0.0 },
		"#FFFFFF": { u: 0.1978, v: 0.3122, Y: 1.0 },
		"#FF0000": { u: 0.4507, v: 0.3486, Y: 0.2126 },
		"#00FF00": { u: 0.125, v: 0.375, Y: 0.7152 },
		"#0000FF": { u: 0.1754, v: 0.1053, Y: 0.0722 },
		"#FFFF00": { u: 0.2039, v: 0.3686, Y: 0.9278 },
		"#00FFFF": { u: 0.1383, v: 0.3037, Y: 0.7874 },
		"#FF00FF": { u: 0.305, v: 0.2198, Y: 0.2848 },
		"#808080": { u: 0.1978, v: 0.3122, Y: 0.2159 },
		"#FFA500": { u: 0.2747, v: 0.3629, Y: 0.4817 },
	},
};
