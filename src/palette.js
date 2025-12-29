import { allocObj, freeObj } from "./pool.js";
import oklch from "./spaces/oklch.js";
import srgb from "./spaces/srgb.js";
import { hexToRgb, lerp, rgbToHex } from "./utils.js";

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const blueHue = 0.72,
	yellowHue = 0.28;

function lerpShortest(start, end, t) {
	let delta = end - start;

	if (delta > 0.5) {
		delta -= 1;
	}

	if (delta < -0.5) {
		delta += 1;
	}

	let result = start + delta * t;

	if (result < 0) {
		result += 1;
	}

	if (result > 1) {
		result -= 1;
	}

	return result;
}

export function generatePalette(hex) {
	const xyz = srgb.from(hexToRgb(hex), allocObj()),
		source = oklch.to(xyz, allocObj(), true);

	const palette = {},
		rgb = allocObj();

	for (const step of steps) {
		if (step === 500) {
			palette[step] = hex;

			continue;
		}

		let t, targetL, targetC;

		if (step < 500) {
			t = (step - 50) / (500 - 50);

			targetL = lerp(0.97, source.l, t);
			targetC = lerp(source.c * 0.03, source.c, t);
		} else {
			t = (step - 500) / (950 - 500);

			targetL = lerp(source.l, 0.12, t);
			targetC = lerp(source.c, source.c * 0.35, t);
		}

		oklch.from(
			{
				l: targetL,
				c: targetC,
				h: source.h,
			},
			xyz
		);

		srgb.to(xyz, rgb);
		palette[step] = rgbToHex(rgb);
	}

	freeObj(xyz);
	freeObj(rgb);
	freeObj(source);

	return palette;
}
