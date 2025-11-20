import { alloc3, free3 } from "../pool.js";
import { clamp, hlgDecode, hlgEncode, matmul, REC2020_TO_XYZ_MATRIX, XYZ_TO_REC2020_MATRIX } from "../utils.js";

const HLG_REF_WHITE_SIGNAL = 0.75,
	HLG_REF_WHITE_SCENE = hlgDecode(HLG_REF_WHITE_SIGNAL);

export default {
	name: "Rec. 2100 HLG",
	long: "ITU-R BT.2100 (Rec. 2100) HDR RGB (HLG, BT.2020 primaries, D65)",
	css: "rec2100-hlg",
	tags: ["device_rgb", "hdr", "transfer_encoding"],
	base: "Rec. 2020",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const rLin = hlgDecode(rgb.r) / HLG_REF_WHITE_SCENE,
			gLin = hlgDecode(rgb.g) / HLG_REF_WHITE_SCENE,
			bLin = hlgDecode(rgb.b) / HLG_REF_WHITE_SCENE;

		const v3 = matmul(alloc3(), REC2020_TO_XYZ_MATRIX, rLin, gLin, bLin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_REC2020_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = hlgEncode(v3[0] * HLG_REF_WHITE_SCENE),
			g = hlgEncode(v3[1] * HLG_REF_WHITE_SCENE),
			b = hlgEncode(v3[2] * HLG_REF_WHITE_SCENE);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 0.75, g: 0.75, b: 0.75 },
		"#FF0000": { r: 0.6559, g: 0.2344, b: 0.1141 },
		"#00FF00": { r: 0.5114, g: 0.7335, b: 0.2645 },
		"#0000FF": { r: 0.1856, g: 0.095, b: 0.7282 },
		"#FFFF00": { r: 0.7413, g: 0.7478, b: 0.2881 },
		"#00FFFF": { r: 0.5411, g: 0.7359, b: 0.7468 },
		"#FF00FF": { r: 0.6697, g: 0.2529, b: 0.7318 },
		"#808080": { r: 0.4142, g: 0.4142, b: 0.4142 },
		"#FFA500": { r: 0.6929, g: 0.5661, b: 0.1984 },
	},
};
