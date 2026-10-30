import { resolveOptions } from "../options.js";
import { alloc3, allocObj, free3, freeObj } from "../pool.js";
import { clamp, fLab, fLabInv, LAB_KAPPA, matmul, optimizeMatrix, preAdaptBradford, round, WHITEPOINT_D65 } from "../utils.js";
import { getObserverNames, getWhitepointNames, getWhitepointXYZ } from "../whites/points.js";

const options = {
	whitepoint: { type: "enum", allowed: getWhitepointNames(), default: "D65", name: "Whitepoint" },
	observer: { type: "enum", allowed: getObserverNames(), default: "2", name: "Observer" },
};

function makeParams(provided) {
	const opts = resolveOptions(options, provided ?? {});

	const wp = getWhitepointXYZ(opts.whitepoint, opts.observer);

	// Fold relative-XYZ scaling into the native-white -> D65 adaptation.
	const relativeToNative = optimizeMatrix([[wp[0], 0, 0], [0, wp[1], 0], [0, 0, wp[2]]]),
		[toXYZ, fromXYZ] = preAdaptBradford(relativeToNative, wp, WHITEPOINT_D65);

	return {
		wp: wp,
		toXYZ: toXYZ,
		fromXYZ: fromXYZ,
	};
}

const defaults = makeParams();

// CSS Color 4 uses the tabulated D50 white, independently of the selected observer.
const cssWhite = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
const cssRelative = optimizeMatrix([[cssWhite[0], 0, 0], [0, 1, 0], [0, 0, cssWhite[2]]]);
const [cssToXYZ, cssFromXYZ] = preAdaptBradford(cssRelative, cssWhite, WHITEPOINT_D65);
export const cssParams = { wp: cssWhite, toXYZ: cssToXYZ, fromXYZ: cssFromXYZ };

const cielab = {
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

		const adapted = matmul(alloc3(), params.toXYZ, xr, yr, zr);

		out.x = adapted[0];
		out.y = adapted[1];
		out.z = adapted[2];

		free3(adapted);

		return out;
	},
	to: (xyz, out = {}, unclamped = false, params = defaults) => {
		const relative = matmul(alloc3(), params.fromXYZ, xyz.x, xyz.y, xyz.z);

		const xr = relative[0],
			yr = relative[1],
			zr = relative[2];

		free3(relative);

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

	format: (lab, params = defaults) => {
		const converted = cielab.from(lab, allocObj(), params);
		cielab.to(converted, converted, true, cssParams);
		const L = round(converted.l * 100, 0),
			a = round(converted.a * 260 - 130, 0),
			b = round(converted.b * 260 - 130, 0);
		freeObj(converted);

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

export default cielab;
