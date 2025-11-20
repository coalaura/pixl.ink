function srgbToLinear(c) {
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb) {
	const r = srgbToLinear(rgb.r),
		g = srgbToLinear(rgb.g),
		b = srgbToLinear(rgb.b);

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(rgb1, rgb2) {
	const L1 = relativeLuminance(rgb1),
		L2 = relativeLuminance(rgb2);

	const lighter = Math.max(L1, L2),
		darker = Math.min(L1, L2);

	return (lighter + 0.05) / (darker + 0.05);
}

export function foregroundColor(rgb) {
	const white = { r: 1, g: 1, b: 1 },
		black = { r: 0, g: 0, b: 0 };

	const contrastWithWhite = contrastRatio(rgb, white),
		contrastWithBlack = contrastRatio(rgb, black);

	return contrastWithWhite > contrastWithBlack ? "white" : "black";
}
