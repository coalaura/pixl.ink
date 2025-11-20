import { resolveOptions } from "../options.js";
import { clamp, fLab, fLabInv, LAB_KAPPA, round } from "../utils.js";
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
	name: "CIELAB",
	long: "CIE 1976 L*a*b* (CIELAB)",
	css: "lab",
	tags: ["perceptual_uniform"],
	base: "CIE 1931 XYZ",
	ui: {
		l: { from: 0, to: 100, step: 1, round: 0, name: "Lightness L", primary: true },
		a: { from: -130, to: 130, step: 1, round: 0, name: "a" },
		b: { from: -130, to: 130, step: 1, round: 0, name: "b" },
	},

	options: options,
	bake: makeParams,

	from: (lab, out = {}, params = defaults) => {
		const L = lab.l * 100,
			a = (lab.a - 0.5) * 260,
			b = (lab.b - 0.5) * 260;

		const fy = (L + 16) / 116,
			fx = fy + a / 500,
			fz = fy - b / 200;

		const xr = fLabInv(fx),
			yr = L > 8 ? ((L + 16) / 116) ** 3 : L / LAB_KAPPA,
			zr = fLabInv(fz);

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

		const L = 116 * fy - 16,
			a = 500 * (fx - fy),
			b = 200 * (fy - fz);

		out.l = clamp(L, 0, 100, unclamped) / 100;
		out.a = clamp(a, -130, 130, unclamped) / 260 + 0.5;
		out.b = clamp(b, -130, 130, unclamped) / 260 + 0.5;

		return out;
	},

	format: lab => {
		const L = round(lab.l * 100, 0),
			a = round(lab.a * 260 - 130, 0),
			b = round(lab.b * 260 - 130, 0);

		return `lab(${L}% ${a} ${b})`;
	},

	expected: {
		"#000000": { l: 0.0, a: 0.5, b: 0.5 },
		"#FFFFFF": { l: 1.0, a: 0.5, b: 0.5 },
		"#FF0000": { l: 0.5324, a: 0.808, b: 0.7585 },
		"#00FF00": { l: 0.8774, a: 0.1685, b: 0.8199 },
		"#0000FF": { l: 0.323, a: 0.8046, b: 0.0852 },
		"#FFFF00": { l: 0.9714, a: 0.4171, b: 0.8634 },
		"#00FFFF": { l: 0.9111, a: 0.3151, b: 0.4457 },
		"#FF00FF": { l: 0.6032, a: 0.8778, b: 0.266 },
		"#808080": { l: 0.5359, a: 0.5, b: 0.5 },
		"#FFA500": { l: 0.7493, a: 0.592, b: 0.8037 },
	},
};
