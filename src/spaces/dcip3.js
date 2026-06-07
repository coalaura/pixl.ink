import { alloc3, free3 } from "../pool.js";
import { clamp, generateMatricesFromPrimaries, matmul, spow, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";

const WHITEPOINT_DCI = [0.314 / 0.351, 1.0, (1 - 0.314 - 0.351) / 0.351];

const [P3DCI_TO_XYZ_DCI] = generateMatricesFromPrimaries(
	[
		[0.68, 0.32],
		[0.265, 0.69],
		[0.15, 0.06],
	],
	WHITEPOINT_DCI
);

const [P3DCI_TO_XYZ_D65, XYZ_TO_P3DCI_D65] = preAdaptBradford(P3DCI_TO_XYZ_DCI, WHITEPOINT_DCI, WHITEPOINT_D65);

const GAMMA = 2.6;

function dciToLinear(v) {
	return spow(v, GAMMA);
}

function linearToDci(v) {
	return spow(v, 1 / GAMMA);
}

export default {
	name: "DCI-P3",
	long: "DCI-P3 (theatrical P3-DCI primaries, γ 2.6, XYZ adapted to D65)",
	css: "dci-p3",
	tags: ["device_rgb", "wide_gamut"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = dciToLinear(rgb.r),
			gLin = dciToLinear(rgb.g),
			bLin = dciToLinear(rgb.b);

		const v3 = matmul(alloc3(), P3DCI_TO_XYZ_D65, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_P3DCI_D65, xyz.x, xyz.y, xyz.z);

		const r = linearToDci(v3[0]),
			g = linearToDci(v3[1]),
			b = linearToDci(v3[2]);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 1.0, g: 1.0, b: 1.0 },
		"#FF0000": { r: 0.9473, g: 0.2738, b: 0.2074 },
		"#00FF00": { r: 0.4548, g: 0.9852, b: 0.3616 },
		"#0000FF": { r: 0.1007, g: 0.1154, b: 0.9653 },
		"#FFFF00": { r: 0.9991, g: 0.9986, b: 0.3923 },
		"#00FFFF": { r: 0.4583, g: 0.9866, b: 0.9935 },
		"#FF00FF": { r: 0.9484, g: 0.2846, b: 0.972 },
		"#808080": { r: 0.5545, g: 0.5545, b: 0.5545 },
		"#FFA500": { r: 0.9673, g: 0.7005, b: 0.2994 },
	},
};
