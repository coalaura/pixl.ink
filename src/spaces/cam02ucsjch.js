import { allocObj, freeObj } from "../pool.js";
import { clamp, DEG2RAD, EPS_PRECISION, normalizeAngle360, RAD2DEG } from "../utils.js";
import cam02ucs from "./cam02ucs.js";

const defaults = cam02ucs.bake();

export default {
	name: "CAM02-UCS JCh",
	long: "CIECAM02 Uniform Color Space (CAM02-UCS), JCh",
	css: "cam02-ucs-jch",
	tags: ["perceptual_uniform", "cylindrical_model"],
	base: "CAM02-UCS",
	ui: {
		j: { from: 0, to: 100, step: 1, round: 0, name: "Lightness J", primary: true },
		c: { from: 0, to: 50, step: 1, round: 0, name: "Chroma C" },
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	options: cam02ucs.options,
	bake: cam02ucs.bake,

	from: (jch, out = {}, params = defaults) => {
		const Jp = jch.j * 100,
			Cp = jch.c * 50,
			hDeg = jch.h * 360;

		const ap = Cp * Math.cos(hDeg * DEG2RAD),
			bp = Cp * Math.sin(hDeg * DEG2RAD);

		return cam02ucs.from(
			{
				j: Jp / 100,
				a: ap / 100 + 0.5,
				b: bp / 100 + 0.5,
			},
			out,
			params
		);
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const jab = cam02ucs.to(xyz, allocObj(), true, params);

		const Jp = jab.j * 100,
			ap = (jab.a - 0.5) * 100,
			bp = (jab.b - 0.5) * 100;

		freeObj(jab);

		const Cp = Math.sqrt(ap * ap + bp * bp);
		const hDeg = normalizeAngle360(Math.atan2(bp, ap) * RAD2DEG);

		const isAchromatic = Cp < EPS_PRECISION;

		out.j = clamp(Jp / 100, 0, 1, unclamped);
		out.c = clamp((isAchromatic ? 0 : Cp) / 50, 0, 1, unclamped);
		out.h = clamp(isAchromatic ? 0 : hDeg / 360, 0, 1, unclamped);

		return out;
	},

	expected: {
		"#000000": { j: 0.0, c: 0.0, h: 0.0 },
		"#FFFFFF": { j: 1.0, c: 0.0446, h: 0.5854 },
		"#FF0000": { j: 0.6005, c: 0.9137, h: 0.0893 },
		"#00FF00": { j: 0.87, c: 0.8866, h: 0.3796 },
		"#0000FF": { j: 0.3122, c: 0.8009, h: 0.7164 },
		"#FFFF00": { j: 0.9741, c: 0.7414, h: 0.2949 },
		"#00FFFF": { j: 0.9026, c: 0.5977, h: 0.55 },
		"#FF00FF": { j: 0.6668, c: 0.8425, h: 0.9165 },
		"#808080": { j: 0.5623, c: 0.0295, h: 0.5854 },
		"#FFA500": { j: 0.7904, c: 0.6544, h: 0.201 },
	},
};
