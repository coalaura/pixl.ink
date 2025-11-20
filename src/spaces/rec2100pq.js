import { alloc3, free3 } from "../pool.js";
import { clamp, matmul, PQ_LUMINANCE_SCALE, pqDecodeST2084, pqEncodeST2084, REC2020_TO_XYZ_MATRIX, XYZ_TO_REC2020_MATRIX } from "../utils.js";

export default {
	name: "Rec. 2100 PQ",
	long: "ITU-R BT.2100 (PQ) HDR RGB (D65, ST 2084)",
	css: "rec2100-pq",
	tags: ["device_rgb", "hdr", "transfer_encoding"],
	base: "Rec. 2020",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		g: { from: 0, to: 1, step: 0.001, round: 3, name: "Green" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (rgb, out = {}) => {
		const r_lin = pqDecodeST2084(rgb.r) / PQ_LUMINANCE_SCALE,
			g_lin = pqDecodeST2084(rgb.g) / PQ_LUMINANCE_SCALE,
			b_lin = pqDecodeST2084(rgb.b) / PQ_LUMINANCE_SCALE;

		const v3 = matmul(alloc3(), REC2020_TO_XYZ_MATRIX, r_lin, g_lin, b_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_REC2020_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = pqEncodeST2084(v3[0] * PQ_LUMINANCE_SCALE),
			g = pqEncodeST2084(v3[1] * PQ_LUMINANCE_SCALE),
			b = pqEncodeST2084(v3[2] * PQ_LUMINANCE_SCALE);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0.0, g: 0.0, b: 0.0 },
		"#FFFFFF": { r: 0.5807, g: 0.5807, b: 0.5807 },
		"#FF0000": { r: 0.5325, g: 0.327, b: 0.2201 },
		"#00FF00": { r: 0.4682, g: 0.5719, b: 0.3473 },
		"#0000FF": { r: 0.2896, g: 0.1968, b: 0.5692 },
		"#FFFF00": { r: 0.5761, g: 0.5795, b: 0.362 },
		"#00FFFF": { r: 0.4803, g: 0.5732, b: 0.579 },
		"#FF00FF": { r: 0.5394, g: 0.3397, b: 0.5711 },
		"#808080": { r: 0.4278, g: 0.4278, b: 0.4278 },
		"#FFA500": { r: 0.551, g: 0.491, b: 0.3001 },
	},
};
