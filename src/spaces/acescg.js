import { alloc3, free3 } from "../pool.js";
import { AP1_TO_XYZ_MATRIX, clamp, matmul, XYZ_TO_AP1_MATRIX } from "../utils.js";

export default {
	name: "ACEScg",
	long: "Academy Color Encoding System - ACEScg (AP1, D60)",
	css: "aces-cg",
	tags: ["device_rgb", "wide_gamut"],
	base: "ACES AP1",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const v3 = matmul(alloc3(), AP1_TO_XYZ_MATRIX, rgb.r, rgb.g, rgb.b);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_AP1_MATRIX, xyz.x, xyz.y, xyz.z);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.g = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.6131, g: 0.0702, b: 0.0206 },
		"#00FF00": { r: 0.3395, g: 0.9164, b: 0.1096 },
		"#0000FF": { r: 0.0474, g: 0.0135, b: 0.8698 },
		"#FFFF00": { r: 0.9526, g: 0.9865, b: 0.1302 },
		"#00FFFF": { r: 0.3869, g: 0.9298, b: 0.9794 },
		"#FF00FF": { r: 0.6605, g: 0.0836, b: 0.8904 },
		"#808080": { r: 0.2159, g: 0.2159, b: 0.2159 },
		"#FFA500": { r: 0.7408, g: 0.415, b: 0.0618 },
	},
};
