import { alloc3, free3 } from "../pool.js";
import { clamp, matmul, preAdaptBradford, spow, WHITEPOINT_D65 } from "../utils.js";

const DCDM_WP = [0.314 / 0.351, 1.0, (1 - 0.314 - 0.351) / 0.351];

// DCDM XYZ is natively the XYZ space itself, gamma 2.6 encoded.
// Thus, the "primaries to XYZ" matrix before adaptation is simply the identity matrix.
const IDENTITY_MATRIX = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

const [DCDM_TO_XYZ_MATRIX, XYZ_TO_DCDM_MATRIX] = preAdaptBradford(IDENTITY_MATRIX, DCDM_WP, WHITEPOINT_D65);

export default {
	name: "DCDM XYZ",
	long: "DCDM XYZ (Digital Cinema Distribution Master), Gamma 2.6",
	css: "dcdm-xyz",
	tags: ["device_rgb", "hdr"],
	base: "CIE 1931 XYZ",
	ui: {
		r: { from: 0, to: 4095, step: 1, round: 0, name: "X" },
		g: { from: 0, to: 4095, step: 1, round: 0, name: "Y" },
		b: { from: 0, to: 4095, step: 1, round: 0, name: "Z" },
	},

	from: (rgb, out = {}) => {
		const x_lin = spow(rgb.r, 2.6),
			y_lin = spow(rgb.g, 2.6),
			z_lin = spow(rgb.b, 2.6);

		const v3 = matmul(alloc3(), DCDM_TO_XYZ_MATRIX, x_lin, y_lin, z_lin);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const v3 = matmul(alloc3(), XYZ_TO_DCDM_MATRIX, xyz.x, xyz.y, xyz.z);

		const r = spow(v3[0], 1 / 2.6),
			g = spow(v3[1], 1 / 2.6),
			b = spow(v3[2], 1 / 2.6);

		free3(v3);

		out.r = clamp(r, 0, 1, unclamped);
		out.g = clamp(g, 0, 1, unclamped);
		out.b = clamp(b, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { r: 0, g: 0, b: 0 },
		"#FFFFFF": { r: 0.9581, g: 1, b: 0.9822 },
		"#FF0000": { r: 0.7023, g: 0.5466, b: 0.2079 },
		"#00FF00": { r: 0.6577, g: 0.8842, b: 0.4276 },
		"#0000FF": { r: 0.4933, g: 0.3515, b: 0.9299 },
		"#FFFF00": { r: 0.8885, g: 0.9741, b: 0.4517 },
		"#00FFFF": { r: 0.7634, g: 0.9142, b: 0.9755 },
		"#FF00FF": { r: 0.7991, g: 0.6077, b: 0.9371 },
		"#808080": { r: 0.5313, g: 0.5545, b: 0.5447 },
		"#FFA500": { r: 0.7808, g: 0.7547, b: 0.3349 },
	},
};
