import { ILLUMINANT_D65, mhvcToXyz, xyzToMhvc, xyzToMunsell } from "munsell";
import { alloc3, free3 } from "../pool.js";
import { clamp, matmul, optimizeMatrix, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";

const HUE_SCALE = 100,
	VALUE_SCALE = 10,
	CHROMA_SCALE = 50;

const IDENTITY = optimizeMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
const [MUNSELL_TO_XYZ_MATRIX, XYZ_TO_MUNSELL_MATRIX] = preAdaptBradford(IDENTITY, [ILLUMINANT_D65.X, 1, ILLUMINANT_D65.Z], WHITEPOINT_D65);

export default {
	name: "Munsell",
	long: "Munsell HVC (Munsell Book of Color Coordinate System)",
	css: "munsell",
	tags: ["notation_system"],
	base: "CIE 1931 XYZ",
	ui: {
		h: { from: 0, to: 100, step: 1, round: 0, name: "Hue" },
		v: { from: 0, to: 10, step: 0.1, round: 1, name: "Value", primary: true },
		c: { from: 0, to: 50, step: 0.1, round: 1, name: "Chroma" },
	},

	from: (munsell, out = {}) => {
		const h = munsell.h * HUE_SCALE,
			v = munsell.v * VALUE_SCALE,
			c = munsell.c * CHROMA_SCALE;

		let xyz;

		try {
			xyz = mhvcToXyz(h, v, c, ILLUMINANT_D65);
		} catch {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		matmul(xyz, MUNSELL_TO_XYZ_MATRIX, xyz[0], xyz[1], xyz[2]);

		out.x = xyz[0];
		out.y = xyz[1];
		out.z = xyz[2];

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const native = matmul(alloc3(), XYZ_TO_MUNSELL_MATRIX, xyz.x, xyz.y, xyz.z);

		let munsell;

		try {
			munsell = xyzToMhvc(native[0], native[1], native[2], ILLUMINANT_D65);
		} catch {
			out.h = 0;
			out.v = 0;
			out.c = 0;

			return out;
		} finally {
			free3(native);
		}

		out.h = clamp(munsell[0] / HUE_SCALE, 0, 1, unclamped);
		out.v = clamp(munsell[1] / VALUE_SCALE, 0, 1, unclamped);
		out.c = clamp(munsell[2] / CHROMA_SCALE, 0, 1, unclamped);

		return out;
	},

	code: xyz => {
		const native = matmul(alloc3(), XYZ_TO_MUNSELL_MATRIX, xyz.x, xyz.y, xyz.z);

		try {
			return xyzToMunsell(native[0], native[1], native[2], ILLUMINANT_D65);
		} catch {
			return "failed";
		} finally {
			free3(native);
		}
	},

	expected: {
		"#000000": { h: 0.0, v: 0.0, c: 0.0 },
		"#FFFFFF": { h: 0.060559, v: 1, c: 0 },
		"#FF0000": { h: 0.077691, v: 0.523952, c: 0.408704 },
		"#00FF00": { h: 0.397877, v: 0.871737, c: 0.369044 },
		"#0000FF": { h: 0.770785, v: 0.327507, c: 0.602475 },
		"#FFFF00": { h: 0.307996, v: 0.969407, c: 0.257577 },
		"#00FFFF": { h: 0.591025, v: 0.908772, c: 0.182045 },
		"#FF00FF": { h: 0.879732, v: 0.598076, c: 0.513619 },
		"#808080": { h: 0, v: 0.525471, c: 0 },
		"#FFA500": { h: 0.177668, v: 0.741719, c: 0.264805 },
	},
};
