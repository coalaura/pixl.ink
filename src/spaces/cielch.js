import { resolveOptions } from "../options.js";
import { clamp, EPS_PERCEPTUAL, fLab, fLabInv, LAB_EPSILON, LAB_KAPPA, round, TAU } from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer);

	return {
		wp: wp,
	};
}

const defaults = makeParams();

export default {
	name: "CIELCh",
	long: "CIE 1976 L*C*h° (Polar CIELAB, often called HCL)",
	css: "lch",
	tags: ["perceptual_uniform", "cylindrical_model"],
	base: "CIELAB",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L", primary: true },
		c: { from: 0, to: 160, step: 1, round: 0, name: "Chroma C" },
		h: { from: 0, to: 360, step: 1, round: 0, name: "Hue (deg)" },
	},

	options: options,
	bake: makeParams,

	from: (lch, out = {}, params = defaults) => {
		const l = lch.l * 100,
			c = lch.c * 160,
			h = lch.h;

		const a = c * Math.cos(h * TAU),
			b = c * Math.sin(h * TAU);

		const fy = (l + 16) / 116,
			fx = a / 500 + fy,
			fz = fy - b / 200;

		const fx3 = fx ** 3,
			fz3 = fz ** 3;

		const xr = fx3 > LAB_EPSILON ? fx3 : fLabInv(fx),
			yr = l > 8 ? ((l + 16) / 116) ** 3 : l / LAB_KAPPA,
			zr = fz3 > LAB_EPSILON ? fz3 : fLabInv(fz);

		const wp = params.wp;

		out.x = xr * wp[0];
		out.y = yr * wp[1];
		out.z = zr * wp[2];

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const wp = params.wp;

		const xr = xyz.x / wp[0],
			yr = xyz.y / wp[1],
			zr = xyz.z / wp[2];

		const fx = fLab(xr),
			fy = fLab(yr),
			fz = fLab(zr);

		const l = 116 * fy - 16,
			a = 500 * (fx - fy),
			b = 200 * (fy - fz);

		const c = Math.sqrt(a * a + b * b),
			cNorm = c / 160;

		const isAch = cNorm < EPS_PERCEPTUAL;

		out.h = isAch ? 0 : (Math.atan2(b, a) / TAU + 1) % 1;

		out.l = clamp(l / 100, 0, 1, unclamped);
		out.c = clamp(cNorm, 0, 1, unclamped);

		return out;
	},

	format: lch => {
		const l = round(lch.l * 100, 0),
			c = round(lch.c * 160, 0),
			h = round(lch.h * 360, 0);

		return `lch(${l}% ${c} ${h})`;
	},

	expected: {
		"#000000": { l: 0.0, c: 0.0, h: 0.0 },
		"#FFFFFF": { l: 1.0, c: 0.0, h: 0.0 },
		"#FF0000": { l: 0.5324, c: 0.6534, h: 0.1111 },
		"#00FF00": { l: 0.8774, c: 0.7486, h: 0.3778 },
		"#0000FF": { l: 0.323, c: 0.8363, h: 0.8508 },
		"#FFFF00": { l: 0.9714, c: 0.6057, h: 0.2857 },
		"#00FFFF": { l: 0.9111, c: 0.3132, h: 0.5455 },
		"#FF00FF": { l: 0.6032, c: 0.7222, h: 0.9118 },
		"#808080": { l: 0.5359, c: 0.0, h: 0.0 },
		"#FFA500": { l: 0.7493, c: 0.5156, h: 0.2032 },
	},
};
