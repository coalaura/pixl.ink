import { alloc3, free3 } from "../pool.js";
import { clamp, linearRgbToXyz, xyzToLinearRgb } from "../utils.js";

function toLinear(n) {
	return -0.5 + n * 8;
}

function toNormalized(v) {
	return (v - -0.5) / 8;
}

export default {
	name: "scRGB",
	long: "scRGB - IEC 61966-2-2 (linear sRGB primaries, extended range)",
	css: "scrgb-linear",
	tags: ["device_rgb", "transfer_encoding", "hdr"],
	base: "sRGB",
	ui: {
		r: { from: -0.5, to: 7.5, step: 0.01, round: 2, name: "Red (linear)" },
		g: { from: -0.5, to: 7.5, step: 0.01, round: 2, name: "Green (linear)" },
		b: { from: -0.5, to: 7.5, step: 0.01, round: 2, name: "Blue (linear)" },
	},

	from: (rgb, out = {}) => {
		const rLin = toLinear(rgb.r),
			gLin = toLinear(rgb.g),
			bLin = toLinear(rgb.b);

		const v3 = linearRgbToXyz(alloc3(), rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToLinearRgb(alloc3(), xyz.x, xyz.y, xyz.z);

		const rN = toNormalized(v3[0]),
			gN = toNormalized(v3[1]),
			bN = toNormalized(v3[2]);

		free3(v3);

		out.r = clamp(rN, 0, 1, unclamped);
		out.g = clamp(gN, 0, 1, unclamped);
		out.b = clamp(bN, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.063, g: 0.063, b: 0.063 },
		"#FFFFFF": { r: 0.188, g: 0.188, b: 0.188 },
		"#FF0000": { r: 0.188, g: 0.063, b: 0.063 },
		"#00FF00": { r: 0.063, g: 0.188, b: 0.063 },
		"#0000FF": { r: 0.063, g: 0.063, b: 0.188 },
		"#FFFF00": { r: 0.188, g: 0.188, b: 0.063 },
		"#00FFFF": { r: 0.063, g: 0.188, b: 0.188 },
		"#FF00FF": { r: 0.188, g: 0.063, b: 0.188 },
		"#808080": { r: 0.089, g: 0.089, b: 0.089 },
		"#FFA500": { r: 0.188, g: 0.11, b: 0.063 },
	},
};
