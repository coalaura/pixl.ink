import { allocObj, freeObj } from "../pool.js";
import { clamp, DEG2RAD, EPS_PRECISION, normalizeAngle360, RAD2DEG } from "../utils.js";
import cam16ucs from "./cam16ucs.js";

const defaults = cam16ucs.bake();

export default {
	name: "CAM16-UCS JCh",
	long: "CAM16 Uniform Color Space (CAM16-UCS), J-C-h",
	css: "cam16-ucs-jch",
	tags: ["perceptual_uniform", "cylindrical_model"],
	base: "CAM16-UCS",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		c: { from: 0, to: 50, step: 1, round: 0, name: "Chroma C" },
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	options: cam16ucs.options,
	bake: cam16ucs.bake,

	from: (jch, out = {}, params = defaults) => {
		const Jp = jch.j * 100,
			Cp = jch.c * 50,
			hDeg = jch.h * 360;

		const hRad = hDeg * DEG2RAD,
			ap = Cp * Math.cos(hRad),
			bp = Cp * Math.sin(hRad);

		const aNorm = ap / 100 + 0.5,
			bNorm = bp / 100 + 0.5;

		return cam16ucs.from(
			{
				j: Jp / 100,
				a: aNorm,
				b: bNorm,
			},
			out,
			params
		);
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const jab = cam16ucs.to(xyz, allocObj(), true, params);

		const Jp = jab.j * 100,
			ap = (jab.a - 0.5) * 100,
			bp = (jab.b - 0.5) * 100;

		freeObj(jab);

		const Cp = Math.hypot(ap, bp);

		let hDeg = 0;

		if (Cp > EPS_PRECISION) {
			hDeg = normalizeAngle360(Math.atan2(bp, ap) * RAD2DEG);
		}

		out.j = clamp(Jp / 100, 0, 1, unclamped);
		out.c = clamp(Cp / 50, 0, 1, unclamped);
		out.h = clamp(hDeg / 360, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { j: 0.0, c: 0.0, h: 0.0 },
		"#FFFFFF": { j: 1.0, c: 0.0437, h: 0.5822 },
		"#FF0000": { j: 0.5918, c: 0.9194, h: 0.0758 },
		"#00FF00": { j: 0.8655, c: 0.898, h: 0.394 },
		"#0000FF": { j: 0.3625, c: 0.7768, h: 0.785 },
		"#FFFF00": { j: 0.968, c: 0.7086, h: 0.3099 },
		"#00FFFF": { j: 0.9064, c: 0.5958, h: 0.5459 },
		"#FF00FF": { j: 0.6739, c: 0.8908, h: 0.9281 },
		"#808080": { j: 0.5623, c: 0.0289, h: 0.5813 },
		"#FFA500": { j: 0.7836, c: 0.6046, h: 0.197 },
	},
};
