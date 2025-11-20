import { ILLUMINANT_D65, mhvcToXyz, xyzToMhvc, xyzToMunsell } from "munsell";
import { clamp, WHITEPOINT_D65 } from "../utils.js";

const HUE_SCALE = 100,
	VALUE_SCALE = 10,
	CHROMA_SCALE = 50;

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

		out.x = xyz[0] / WHITEPOINT_D65[0];
		out.y = xyz[1] / WHITEPOINT_D65[1];
		out.z = xyz[2] / WHITEPOINT_D65[2];

		return out;
	},
	to: (xyz, out = {}, unclamped = false) => {
		const xScaled = xyz.x * WHITEPOINT_D65[0],
			yScaled = xyz.y * WHITEPOINT_D65[1],
			zScaled = xyz.z * WHITEPOINT_D65[2];

		let munsell;

		try {
			munsell = xyzToMhvc(xScaled, yScaled, zScaled, ILLUMINANT_D65);
		} catch {
			out.h = 0;
			out.v = 0;
			out.c = 0;

			return out;
		}

		out.h = clamp(munsell[0] / HUE_SCALE, 0, 1, unclamped);
		out.v = clamp(munsell[1] / VALUE_SCALE, 0, 1, unclamped);
		out.c = clamp(munsell[2] / CHROMA_SCALE, 0, 1, unclamped);

		return out;
	},

	code: xyz => {
		const dX = xyz.x * WHITEPOINT_D65[0],
			dY = xyz.y * WHITEPOINT_D65[1],
			dZ = xyz.z * WHITEPOINT_D65[2];

		try {
			return xyzToMunsell(dX, dY, dZ, ILLUMINANT_D65);
		} catch {
			return "failed";
		}
	},

	expected: {
		"#000000": { h: 0.0, v: 0.0, c: 0.0 },
		"#FFFFFF": { h: 0.6521, v: 0.9999, c: 0.0461 },
		"#FF0000": { h: 0.0816, v: 0.5238, c: 0.3764 },
		"#00FF00": { h: 0.4028, v: 0.8716, c: 0.3834 },
		"#0000FF": { h: 0.7656, v: 0.3279, c: 0.6192 },
		"#FFFF00": { h: 0.3295, v: 0.9692, c: 0.2538 },
		"#00FFFF": { h: 0.6025, v: 0.9087, c: 0.2144 },
		"#FF00FF": { h: 0.865, v: 0.5981, c: 0.498 },
		"#808080": { h: 0.6287, v: 0.5254, c: 0.0268 },
		"#FFA500": { h: 0.1955, v: 0.7415, c: 0.2451 },
	},
};
