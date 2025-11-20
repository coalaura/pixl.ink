import { allocObj, freeObj } from "../pool.js";
import { clamp, DEG2RAD, JZAZBZ_AZBZ_SCALE, normalizeAngle360, RAD2DEG } from "../utils.js";
import jzazbz from "./jzazbz.js";

export default {
	name: "JzCzHz",
	long: "JzCzHz - Polar Form of JzAzBz (J-C-h)",
	css: "jzczhz",
	tags: ["perceptual_uniform", "hdr", "cylindrical_model"],
	base: "JzAzBz",
	ui: {
		Jz: { from: 0, to: 1, step: 0.001, round: 3, name: "Jz", primary: true },
		Cz: { from: 0, to: 0.26, step: 0.001, round: 3, name: "Chroma Cz" },
		Hz: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	from: (jch, out = {}) => {
		const Jz = jch.Jz,
			Cz_phys = jch.Cz * 0.26,
			H_deg = jch.Hz * 360,
			H_rad = H_deg * DEG2RAD;

		const Az_i = Cz_phys * Math.cos(H_rad),
			Bz_i = Cz_phys * Math.sin(H_rad);

		const Az = Az_i / JZAZBZ_AZBZ_SCALE + 0.5,
			Bz = Bz_i / JZAZBZ_AZBZ_SCALE + 0.5;

		return jzazbz.from(
			{
				Jz: Jz,
				Az: Az,
				Bz: Bz,
			},
			out
		);
	},
	to: (xyz, out = {}, unclamped = false) => {
		const jab = jzazbz.to(xyz, allocObj(), true);

		const Az_i = (jab.Az - 0.5) * JZAZBZ_AZBZ_SCALE,
			Bz_i = (jab.Bz - 0.5) * JZAZBZ_AZBZ_SCALE;

		const Cz_phys = Math.sqrt(Az_i * Az_i + Bz_i * Bz_i),
			H_rad = Math.atan2(Bz_i, Az_i),
			H_deg = normalizeAngle360(H_rad * RAD2DEG);

		const Cz = Cz_phys / 0.26,
			Hz = H_deg / 360;

		out.Jz = clamp(jab.Jz, 0, 1, unclamped);
		out.Cz = clamp(Cz, 0, 1, unclamped);
		out.Hz = clamp(Hz, 0, 1, unclamped);

		freeObj(jab);

		return out;
	},

	expected: {
		"#000000": { Jz: 0.0, Cz: 0.0, Hz: 0.0 },
		"#FFFFFF": { Jz: 0.2221, Cz: 0.0008, Hz: 0.5888 },
		"#FF0000": { Jz: 0.1344, Cz: 0.6251, Hz: 0.1208 },
		"#00FF00": { Jz: 0.1768, Cz: 0.6208, Hz: 0.3681 },
		"#0000FF": { Jz: 0.0958, Cz: 0.7319, Hz: 0.7156 },
		"#FFFF00": { Jz: 0.2096, Cz: 0.53, Hz: 0.2833 },
		"#00FFFF": { Jz: 0.1926, Cz: 0.2951, Hz: 0.5658 },
		"#FF00FF": { Jz: 0.1584, Cz: 0.5469, Hz: 0.8915 },
		"#808080": { Jz: 0.1183, Cz: 0.0006, Hz: 0.5888 },
		"#FFA500": { Jz: 0.1694, Cz: 0.4884, Hz: 0.2105 },
	},
};
