import { alloc3, allocObj, free3, freeObj } from "../pool.js";
import { clamp, matmul, optimizeMatrix, preAdaptBradford, WHITEPOINT_D65 } from "../utils.js";
import { OFFSETS, RADIAL, VALUES, XY } from "./munsell.data.js";

const HUE_SCALE = 100,
	VALUE_SCALE = 10,
	CHROMA_SCALE = 50;

const HUE_COUNT = 40,
	HUE_STEP = 2.5,
	CHROMA_STEP = 2;

// Use the renotation's tabulated C white, not a separately calculated illuminant.
// Centore (2012), equations 7, 8 and 12; https://doi.org/10.1002/col.20715.
const WHITE_X = 0.31006,
	WHITE_Y = 0.31616,
	WHITEPOINT = [WHITE_X / WHITE_Y, 1, (1 - WHITE_X - WHITE_Y) / WHITE_Y];

const IDENTITY = optimizeMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
	[MUNSELL_TO_XYZ_MATRIX, XYZ_TO_MUNSELL_MATRIX] = preAdaptBradford(IDENTITY, WHITEPOINT, WHITEPOINT_D65);

const LUMINANCES = VALUES.map(valueToY),
	HUE_NAMES = ["R", "YR", "Y", "GY", "G", "BG", "B", "PB", "P", "RP"],
	SEED_CHROMAS = [2, 8, 24, 48],
	SEED_OFFSETS = [0, HUE_STEP / 2, -HUE_STEP / 2];

const MAX_ITERATIONS = 48,
	MAX_BACKTRACKS = 16,
	NEUTRAL_EPSILON = 1e-12,
	LUMINANCE_EPSILON = 1e-12,
	INVERSE_EPSILON = 1e-11;

function wrapHue(hue) {
	return ((hue % HUE_SCALE) + HUE_SCALE) % HUE_SCALE;
}

function valueToY(value) {
	// Perfect-diffuser relative luminance, Y=1 at V=10.
	return value * (1.1914 + value * (-0.22533 + value * (0.23352 + value * (-0.020484 + value * 0.00081939)))) / 100;
}

function yToValue(luminance) {
	if (luminance <= 0) {
		return 0;
	}

	if (luminance >= 1) {
		return VALUE_SCALE;
	}

	let lower = 0,
		upper = VALUE_SCALE,
		value = luminance < 0.01 ? luminance / 0.011914 : VALUE_SCALE * Math.cbrt(luminance);

	// Safeguarded Newton inversion of the monotone quintic. The bracket also
	// handles very dark colors without a quantized luminance lookup table.
	for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
		const difference = valueToY(value) - luminance;

		if (Math.abs(difference) <= 2e-15 * Math.max(luminance, 1e-8)) {
			return value;
		}

		if (difference > 0) {
			upper = value;
		} else {
			lower = value;
		}

		const derivative = (1.1914 + value * (-0.45066 + value * (0.70056 + value * (-0.081936 + value * 0.00409695)))) / 100,
			candidate = value - difference / derivative;

		value = candidate > lower && candidate < upper ? candidate : (lower + upper) / 2;
	}

	throw new RangeError("Munsell value inversion did not converge");
}

function valueBracket(out, value) {
	let lower = 0;

	while (lower + 1 < VALUES.length && VALUES[lower + 1] <= value) {
		lower++;
	}

	const upper = value <= VALUES[0] || value === VALUES[lower] ? lower : Math.min(lower + 1, VALUES.length - 1);

	out[0] = lower;
	out[1] = upper;
	out[2] = lower === upper ? 0 : (valueToY(value) - LUMINANCES[lower]) / (LUMINANCES[upper] - LUMINANCES[lower]);

	return out;
}

function radialSegment(level, hue, chroma) {
	const rows = RADIAL[VALUES[level]];

	if (!rows || rows.length === 0) {
		return false;
	}

	let selected = rows[0];

	for (let index = 1; index < rows.length && rows[index][0] <= chroma; index++) {
		selected = rows[index];
	}

	for (let index = 1; index < selected.length; index += 2) {
		if (hue >= selected[index] && hue < selected[index + 1]) {
			return true;
		}
	}

	return false;
}

function polarInterpolate(out, firstX, firstY, secondX, secondY, amount) {
	const firstAngle = Math.atan2(firstY - WHITE_Y, firstX - WHITE_X),
		secondAngle = Math.atan2(secondY - WHITE_Y, secondX - WHITE_X),
		difference = Math.atan2(Math.sin(secondAngle - firstAngle), Math.cos(secondAngle - firstAngle));

	const firstRadius = Math.hypot(firstX - WHITE_X, firstY - WHITE_Y),
		secondRadius = Math.hypot(secondX - WHITE_X, secondY - WHITE_Y),
		radius = firstRadius + amount * (secondRadius - firstRadius),
		angle = firstAngle + amount * difference;

	out[0] = WHITE_X + radius * Math.cos(angle);
	out[1] = WHITE_Y + radius * Math.sin(angle);

	return out;
}

function sampleRay(out, level, hueIndex, ring) {
	if (ring === 0) {
		out[0] = WHITE_X;
		out[1] = WHITE_Y;

		return out;
	}

	const row = level * HUE_COUNT + hueIndex,
		start = OFFSETS[row],
		end = OFFSETS[row + 1],
		count = (end - start) / 2;

	if (count === 0) {
		// The source has no 10Y 0.2 row. Construct its support midway between
		// 7.5Y and 2.5GY in polar xy; no original reference sample is changed.
		const neighbor = alloc3();

		sampleRay(out, level, (hueIndex + HUE_COUNT - 1) % HUE_COUNT, ring);
		sampleRay(neighbor, level, (hueIndex + 1) % HUE_COUNT, ring);
		polarInterpolate(out, out[0], out[1], neighbor[0], neighbor[1], 0.5);

		free3(neighbor);

		return out;
	}

	if (ring <= count) {
		const offset = start + (ring - 1) * 2;

		out[0] = XY[offset];
		out[1] = XY[offset + 1];

		return out;
	}

	// Beyond a ray's reference samples, extend its last chroma segment. This is
	// a mathematical extension, not a claim of physical surface-color validity.
	// Far outside the data it need not have a unique HVC inverse.
	const lastX = XY[end - 2],
		lastY = XY[end - 1],
		previousX = count === 1 ? WHITE_X : XY[end - 4],
		previousY = count === 1 ? WHITE_Y : XY[end - 3];

	out[0] = lastX + (ring - count) * (lastX - previousX);
	out[1] = lastY + (ring - count) * (lastY - previousY);

	return out;
}

function sampleRing(out, level, hue, ring) {
	const position = hue / HUE_STEP,
		first = Math.floor(position),
		amount = position - first;

	sampleRay(out, level, first, ring);

	if (amount === 0 || ring === 0) {
		return out;
	}

	const second = sampleRay(alloc3(), level, (first + 1) % HUE_COUNT, ring);

	if (radialSegment(level, hue, ring * CHROMA_STEP)) {
		polarInterpolate(out, out[0], out[1], second[0], second[1], amount);
	} else {
		out[0] += amount * (second[0] - out[0]);
		out[1] += amount * (second[1] - out[1]);
	}

	free3(second);

	return out;
}

function samplePlane(out, level, hue, chroma) {
	const position = chroma / CHROMA_STEP,
		first = Math.floor(position),
		amount = position - first;

	sampleRing(out, level, hue, first);

	if (amount === 0) {
		return out;
	}

	const second = sampleRing(alloc3(), level, hue, first + 1);

	out[0] += amount * (second[0] - out[0]);
	out[1] += amount * (second[1] - out[1]);

	free3(second);

	return out;
}

function sampleXY(out, hue, chroma, bracket) {
	const wrapped = wrapHue(hue);

	samplePlane(out, bracket[0], wrapped, chroma);

	if (bracket[0] === bracket[1]) {
		return out;
	}

	const second = samplePlane(alloc3(), bracket[1], wrapped, chroma);

	out[0] += bracket[2] * (second[0] - out[0]);
	out[1] += bracket[2] * (second[1] - out[1]);

	free3(second);

	return out;
}

function initialGuess(out, targetX, targetY, bracket, probeChroma) {
	const point = alloc3(),
		deltaX = targetX - WHITE_X,
		deltaY = targetY - WHITE_Y;

	let bestError = Infinity;

	for (let index = 0; index < HUE_COUNT; index++) {
		const hue = index * HUE_STEP;

		sampleXY(point, hue, probeChroma, bracket);

		const rayX = point[0] - WHITE_X,
			rayY = point[1] - WHITE_Y,
			lengthSquared = rayX * rayX + rayY * rayY;

		if (lengthSquared <= 1e-24) {
			continue;
		}

		const chroma = Math.max(0, probeChroma * (deltaX * rayX + deltaY * rayY) / lengthSquared);

		sampleXY(point, hue, chroma, bracket);

		const error = (point[0] - targetX) ** 2 + (point[1] - targetY) ** 2;

		if (error < bestError) {
			bestError = error;
			out[0] = hue;
			out[1] = chroma;
		}
	}

	free3(point);

	return out;
}

function refineInverse(out, targetX, targetY, bracket, tolerance) {
	const current = alloc3(),
		upper = alloc3(),
		lower = alloc3(),
		candidate = alloc3();

	let hue = out[0],
		chroma = out[1];

	try {
		for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
			sampleXY(current, hue, chroma, bracket);

			const differenceX = current[0] - targetX,
				differenceY = current[1] - targetY,
				error = differenceX * differenceX + differenceY * differenceY;

			if (error <= tolerance * tolerance) {
				out[0] = wrapHue(hue);
				out[1] = chroma;

				return true;
			}

			const hueDelta = 1e-4,
				chromaDelta = Math.max(1e-5, chroma * 1e-5),
				lowerChroma = Math.max(0, chroma - chromaDelta);

			sampleXY(upper, hue + hueDelta, chroma, bracket);
			sampleXY(lower, hue - hueDelta, chroma, bracket);

			const dxHue = (upper[0] - lower[0]) / (2 * hueDelta),
				dyHue = (upper[1] - lower[1]) / (2 * hueDelta);

			sampleXY(upper, hue, chroma + chromaDelta, bracket);
			sampleXY(lower, hue, lowerChroma, bracket);

			const dxChroma = (upper[0] - lower[0]) / (chroma + chromaDelta - lowerChroma),
				dyChroma = (upper[1] - lower[1]) / (chroma + chromaDelta - lowerChroma),
				determinant = dxHue * dyChroma - dxChroma * dyHue;

			if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-24) {
				return false;
			}

			const hueStep = (differenceX * dyChroma - differenceY * dxChroma) / determinant,
				chromaStep = (dxHue * differenceY - dyHue * differenceX) / determinant;

			if (!Number.isFinite(hueStep) || !Number.isFinite(chromaStep)) {
				return false;
			}

			let scale = Math.min(1, 5 / Math.max(Math.abs(hueStep), 1e-12), Math.max(2, chroma / 2) / Math.max(Math.abs(chromaStep), 1e-12)),
				accepted = false;

			for (let backtrack = 0; backtrack < MAX_BACKTRACKS; backtrack++) {
				const nextHue = hue - scale * hueStep,
					nextChroma = Math.max(0, chroma - scale * chromaStep);

				sampleXY(candidate, nextHue, nextChroma, bracket);

				const nextError = (candidate[0] - targetX) ** 2 + (candidate[1] - targetY) ** 2;

				if (nextError < error) {
					hue = nextHue;
					chroma = nextChroma;
					accepted = true;

					break;
				}

				scale *= 0.5;
			}

			if (!accepted) {
				return false;
			}
		}

		return false;
	} finally {
		free3(candidate);
		free3(lower);
		free3(upper);
		free3(current);
	}
}

function invertXY(out, targetX, targetY, bracket) {
	const tolerance = INVERSE_EPSILON * Math.min(1, targetY / Math.max(1, Math.abs(targetX), Math.abs(1 - targetX - targetY)));

	for (const probeChroma of SEED_CHROMAS) {
		initialGuess(out, targetX, targetY, bracket, probeChroma);

		const seedHue = out[0],
			seedChroma = out[1];

		// At a hue knot the derivative can straddle two different segments.
		// Retry inside the neighboring cells if that first step cannot descend.
		for (const offset of SEED_OFFSETS) {
			out[0] = seedHue + offset;
			out[1] = seedChroma;

			if (refineInverse(out, targetX, targetY, bracket, tolerance)) {
				return out;
			}
		}
	}

	throw new RangeError("Munsell hue/chroma inversion did not converge");
}

const munsell = {
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

	from: (native, out = {}) => {
		const hue = native.h * HUE_SCALE,
			value = clamp(native.v * VALUE_SCALE, 0, VALUE_SCALE),
			chroma = Math.max(0, native.c * CHROMA_SCALE);

		if (!Number.isFinite(native.h) || !Number.isFinite(native.v) || !Number.isFinite(native.c) || !Number.isFinite(hue) || !Number.isFinite(chroma)) {
			throw new RangeError("Munsell coordinates must be finite numbers");
		}

		if (value === 0) {
			out.x = 0;
			out.y = 0;
			out.z = 0;

			return out;
		}

		const point = alloc3(),
			bracket = valueBracket(alloc3(), value);

		try {
			sampleXY(point, hue, chroma, bracket);

			if (!(point[1] > 0) || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
				throw new RangeError("Munsell coordinates have no finite positive-luminance XYZ conversion");
			}

			const luminance = valueToY(value),
				scale = luminance / point[1];

			matmul(point, MUNSELL_TO_XYZ_MATRIX, point[0] * scale, luminance, (1 - point[0] - point[1]) * scale);

			if (!Number.isFinite(point[0]) || !Number.isFinite(point[1]) || !Number.isFinite(point[2])) {
				throw new RangeError("Munsell conversion overflowed");
			}

			out.x = point[0];
			out.y = point[1];
			out.z = point[2];

			return out;
		} finally {
			free3(bracket);
			free3(point);
		}
	},
	to: (xyz, out = {}, unclamped = false) => {
		if (!Number.isFinite(xyz.x) || !Number.isFinite(xyz.y) || !Number.isFinite(xyz.z)) {
			throw new RangeError("XYZ coordinates must be finite numbers");
		}

		if (xyz.x === 0 && xyz.y === 0 && xyz.z === 0) {
			out.h = 0;
			out.v = 0;
			out.c = 0;

			return out;
		}

		const native = matmul(alloc3(), XYZ_TO_MUNSELL_MATRIX, xyz.x, xyz.y, xyz.z),
			bracket = alloc3(),
			solution = alloc3();

		try {
			const sum = native[0] + native[1] + native[2],
				luminance = native[1];

			if (!(sum > 0) || !(luminance > 0) || luminance > 1 + LUMINANCE_EPSILON || !Number.isFinite(sum)) {
				throw new RangeError("XYZ lies outside the Munsell luminance domain (0 < Y_C <= 1)");
			}

			const targetX = native[0] / sum,
				targetY = luminance / sum,
				value = yToValue(Math.min(1, luminance));

			if (!Number.isFinite(targetX) || !(targetY > 0) || !Number.isFinite(targetY)) {
				throw new RangeError("XYZ has no finite positive-luminance chromaticity");
			}

			if (Math.hypot(targetX - WHITE_X, targetY - WHITE_Y) <= NEUTRAL_EPSILON) {
				out.h = 0;
				out.v = value / VALUE_SCALE;
				out.c = 0;

				return out;
			}

			valueBracket(bracket, value);
			invertXY(solution, targetX, targetY, bracket);

			out.h = solution[0] / HUE_SCALE;
			out.v = value / VALUE_SCALE;
			out.c = clamp(solution[1] / CHROMA_SCALE, 0, 1, unclamped);

			return out;
		} finally {
			free3(solution);
			free3(bracket);
			free3(native);
		}
	},

	code: xyz => {
		const native = allocObj();

		try {
			munsell.to(xyz, native, true);

			const value = (native.v * VALUE_SCALE).toFixed(1),
				chroma = (native.c * CHROMA_SCALE).toFixed(1);

			if (Number(chroma) === 0) {
				return `N ${value}`;
			}

			// Round before choosing the hue family, including the 10RP/0R seam.
			const hue = Math.round(wrapHue(native.h * HUE_SCALE)),
				family = (Math.ceil(hue / 10) + HUE_NAMES.length - 1) % HUE_NAMES.length,
				prefix = hue % 10 || 10;

			return `${prefix}${HUE_NAMES[family]} ${value}/${chroma}`;
		} catch (error) {
			if (error instanceof RangeError) {
				return "failed";
			}

			throw error;
		} finally {
			freeObj(native);
		}
	},

	expected: {
		"#000000": { h: 0, v: 0, c: 0 },
		"#FFFFFF": { h: 0, v: 1, c: 0 },
		"#FF0000": { h: 0.078103, v: 0.523950, c: 0.411031 },
		"#00FF00": { h: 0.397602, v: 0.871738, c: 0.370389 },
		"#0000FF": { h: 0.769311, v: 0.327507, c: 0.589694 },
		"#FFFF00": { h: 0.307737, v: 0.969407, c: 0.258325 },
		"#00FFFF": { h: 0.591120, v: 0.908773, c: 0.182570 },
		"#FF00FF": { h: 0.879727, v: 0.598074, c: 0.514062 },
		"#808080": { h: 0, v: 0.525471, c: 0 },
		"#FFA500": { h: 0.178049, v: 0.741719, c: 0.265302 },
	},
};

export default munsell;
