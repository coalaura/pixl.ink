import { alloc3, free3 } from "./pool.js";
import { clamp, linearToSrgb, matmul, optimizeMatrix, srgbToLinear } from "./utils.js";

const M_PROTANOPIA = optimizeMatrix([
	[0.56667, 0.43333, 0.0],
	[0.55833, 0.44167, 0.0],
	[0.0, 0.24167, 0.75833],
]);

const M_DEUTERANOPIA = optimizeMatrix([
	[0.625, 0.375, 0.0],
	[0.0, 0.7, 0.3],
	[0.0, 0.3, 0.7],
]);

const M_TRITANOPIA = optimizeMatrix([
	[0.95, 0.05, 0.0],
	[0.0, 0.43333, 0.56667],
	[0.0, 0.475, 0.525],
]);

const XYZ_TO_LMS = optimizeMatrix([
	[0.4002, 0.7075, -0.0807],
	[-0.228, 1.15, 0.0612],
	[0.0, 0.0, 0.9184],
]);

const LMS_TO_XYZ = optimizeMatrix([
	[1.850242944943, -1.138301637867, 0.238434958509],
	[0.366830775171, 0.64388454484, -0.010673443584],
	[0.0, 0.0, 1.088850174216],
]);

const RGBL_TO_XYZ = optimizeMatrix([
	[0.412390799266, 0.357584339384, 0.180480788402],
	[0.212639005872, 0.715168678768, 0.072192315361],
	[0.019330818716, 0.119194779795, 0.95053215225],
]);

const XYZ_TO_RGBL = optimizeMatrix([
	[3.240969941905, -1.53738317757, -0.498610760293],
	[-0.969243636281, 1.875967501508, 0.041555057407],
	[0.055630079697, -0.203976958889, 1.056971514243],
]);

function achromatopsiaLinear(r, g, b) {
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function blueConeMonochromacyLinear(rgb) {
	matmul(rgb, RGBL_TO_XYZ, rgb[0], rgb[1], rgb[2]);

	matmul(rgb, XYZ_TO_LMS, rgb[0], rgb[1], rgb[2]);

	matmul(rgb, LMS_TO_XYZ, 0, 0, rgb[2]);

	matmul(rgb, XYZ_TO_RGBL, rgb[0], rgb[1], rgb[2]);

	return rgb;
}

function dichromatLinear(linearRgb, type) {
	switch (type) {
		case "protanopia": {
			matmul(linearRgb, M_PROTANOPIA, linearRgb[0], linearRgb[1], linearRgb[2]);

			break;
		}
		case "deuteranopia": {
			matmul(linearRgb, M_DEUTERANOPIA, linearRgb[0], linearRgb[1], linearRgb[2]);

			break;
		}
		case "tritanopia": {
			matmul(linearRgb, M_TRITANOPIA, linearRgb[0], linearRgb[1], linearRgb[2]);

			break;
		}
	}

	return linearRgb;
}

function lConeMonochromacyLinear(rgb) {
	matmul(rgb, RGBL_TO_XYZ, rgb[0], rgb[1], rgb[2]);

	matmul(rgb, XYZ_TO_LMS, rgb[0], rgb[1], rgb[2]);

	matmul(rgb, LMS_TO_XYZ, rgb[0], 0, 0);

	matmul(rgb, XYZ_TO_RGBL, rgb[0], rgb[1], rgb[2]);

	return rgb;
}

function mConeMonochromacyLinear(rgb) {
	matmul(rgb, RGBL_TO_XYZ, rgb[0], rgb[1], rgb[2]);

	matmul(rgb, XYZ_TO_LMS, rgb[0], rgb[1], rgb[2]);

	matmul(rgb, LMS_TO_XYZ, 0, rgb[1], 0);

	matmul(rgb, XYZ_TO_RGBL, rgb[0], rgb[1], rgb[2]);

	return rgb;
}

function blendLinear(baseLin, targetLin, severity) {
	targetLin[0] = (1 - severity) * baseLin[0] + severity * targetLin[0];
	targetLin[1] = (1 - severity) * baseLin[1] + severity * targetLin[1];
	targetLin[2] = (1 - severity) * baseLin[2] + severity * targetLin[2];

	return targetLin;
}

export const modes = {
	none: {
		name: "None",
		description: "Normal trichromatic vision with L, M, and S cones functioning.",
	},

	// Red-green (L/M) deficiencies
	protanopia: {
		name: "Protanopia (red missing)",
		description: "L-cones are absent. The red-green axis collapses: reds/oranges look darker and reds/greens become confusable; the blue-yellow axis is largely preserved.",
	},
	protanomaly: {
		name: "Protanomaly (red weak)",
		description: "L-cone sensitivity is shifted toward M, reducing red-green contrast. Reds appear dimmer/less saturated. This mode uses a slight fixed severity.",
	},

	deuteranopia: {
		name: "Deuteranopia (green missing)",
		description: "M-cones are absent. The red-green axis collapses (reds/greens confusable) but brightness is less affected than in protanopia.",
	},
	deuteranomaly: {
		name: "Deuteranomaly (green weak)",
		description: "M-cone sensitivity is shifted. This common condition reduces red-green separation; greens often skew yellowish/grayish. Uses a slight fixed severity.",
	},

	// Blue-yellow (S) deficiencies
	tritanopia: {
		name: "Tritanopia (blue missing)",
		description: "S-cones are absent. The blue-yellow axis collapses: blues and greens converge toward cyan; yellows and purples can be confused. Rare.",
	},
	tritanomaly: {
		name: "Tritanomaly (blue weak)",
		description: "S-cone sensitivity is shifted, reducing blue-yellow contrast. Greens often drift toward cyan. Rare. Uses a slight fixed severity.",
	},

	// Cone monochromacies
	s_cone_monochromacy: {
		name: "S-cone monochromacy (blue only)",
		description:
			"Only S-cones function; L and M are non-functional. Perception collapses to a single blue-yellow dimension with low chroma and reduced acuity; light sensitivity is common.",
	},
	l_cone_monochromacy: {
		name: "L-cone monochromacy (red only)",
		description: "Only L-cones function. Vision becomes largely luminance-like from long wavelengths with extremely limited hue variation.",
	},
	m_cone_monochromacy: {
		name: "M-cone monochromacy (green only)",
		description: "Only M-cones function. Vision becomes largely luminance-like from mid wavelengths with extremely limited hue variation.",
	},

	// Achromat(-) conditions
	achromatopsia: {
		name: "Achromatopsia (no color)",
		description: "All cones are non-functional. Rod-mediated grayscale vision with very low chroma and acuity; strong light sensitivity (photophobia) is typical.",
	},
	achromatomaly: {
		name: "Achromatomaly (reduced color)",
		description: "Partial cone dysfunction causing strong desaturation toward gray. Modeled here as a slight blend toward grayscale.",
	},
};

export function simulateCvdSrgbGamma(outObj, rgbGamma, mode, unclamped = false) {
	if (!mode || mode === "none") {
		outObj.r = rgbGamma.r;
		outObj.g = rgbGamma.g;
		outObj.b = rgbGamma.b;

		return outObj;
	}

	const lin = alloc3(),
		out = alloc3();

	lin[0] = srgbToLinear(rgbGamma.r);
	lin[1] = srgbToLinear(rgbGamma.g);
	lin[2] = srgbToLinear(rgbGamma.b);

	out[0] = lin[0];
	out[1] = lin[1];
	out[2] = lin[2];

	switch (mode) {
		case "protanopia":
		case "deuteranopia":
		case "tritanopia": {
			dichromatLinear(out, mode);

			break;
		}

		case "protanomaly": {
			dichromatLinear(out, "protanopia");

			blendLinear(lin, out, 0.5);

			break;
		}

		case "deuteranomaly": {
			dichromatLinear(out, "deuteranopia");

			blendLinear(lin, out, 0.5);

			break;
		}

		case "tritanomaly": {
			dichromatLinear(out, "tritanopia");

			blendLinear(lin, out, 0.5);

			break;
		}

		case "achromatopsia": {
			const gray = achromatopsiaLinear(lin[0], lin[1], lin[2]);

			out[0] = gray;
			out[1] = gray;
			out[2] = gray;

			break;
		}

		case "achromatomaly": {
			const gray = achromatopsiaLinear(lin[0], lin[1], lin[2]);

			out[0] = gray;
			out[1] = gray;
			out[2] = gray;

			blendLinear(lin, out, 0.5);

			break;
		}

		case "s_cone_monochromacy": {
			blueConeMonochromacyLinear(out);

			break;
		}

		case "l_cone_monochromacy": {
			lConeMonochromacyLinear(out);

			break;
		}

		case "m_cone_monochromacy": {
			mConeMonochromacyLinear(out);

			break;
		}
	}

	free3(lin);

	outObj.r = clamp(linearToSrgb(out[0]), 0, 1, unclamped);
	outObj.g = clamp(linearToSrgb(out[1]), 0, 1, unclamped);
	outObj.b = clamp(linearToSrgb(out[2]), 0, 1, unclamped);

	free3(out);

	return outObj;
}
