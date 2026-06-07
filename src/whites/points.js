function xyToXyzY1(x, y) {
	if (y === 0) {
		return [0, 0, 0];
	}

	const X = x / y,
		Y = 1.0,
		Z = (1 - x - y) / y;

	return [X, Y, Z];
}

function calculateDaylight_xy(T) {
	if (T < 4000 || T > 25000) {
		throw new Error("CIE Daylight definition valid only for 4000K-25000K");
	}

	let x_d;

	if (T <= 7000) {
		// 4000K to 7000K
		x_d = (-4.607 * Math.pow(10, 9)) / Math.pow(T, 3) + (2.9678 * Math.pow(10, 6)) / Math.pow(T, 2) + (0.09911 * Math.pow(10, 3)) / T + 0.244063;
	} else {
		// 7000K to 25000K
		x_d = (-2.0064 * Math.pow(10, 9)) / Math.pow(T, 3) + (1.9018 * Math.pow(10, 6)) / Math.pow(T, 2) + (0.24748 * Math.pow(10, 3)) / T + 0.23704;
	}

	// Calculate y derived from x
	const y_d = -3.0 * Math.pow(x_d, 2) + 2.87 * x_d - 0.275;

	return [x_d, y_d];
}

function calculatePlanckian_xy(T) {
	// Approximation typically valid for 1667K to 25000K
	const x_c = (-0.2661239 * Math.pow(10, 9)) / Math.pow(T, 3) - (0.2343589 * Math.pow(10, 6)) / Math.pow(T, 2) + (0.8776956 * Math.pow(10, 3)) / T + 0.17991;

	let y_c;

	if (T < 4000) {
		y_c = -1.1063814 * Math.pow(x_c, 3) - 1.3481102 * Math.pow(x_c, 2) + 2.18555832 * x_c - 0.20219683;
	} else {
		y_c = -0.9549476 * Math.pow(x_c, 3) - 1.37418593 * Math.pow(x_c, 2) + 2.09137015 * x_c - 0.16748867;
	}

	return [x_c, y_c];
}

export const descriptions = {
	A: "A - Incandescent/tungsten reference illuminant with a correlated color temperature of 2856 K. Defined by CIE in 1931 using a gas-filled coiled-tungsten filament. It appears very warm (yellow-orange) and remains the primary standard for indoor lighting calibration.",
	B: "B - Historical 'noon sunlight' illuminant with a correlated color temperature of 4874 K. Derived by filtering Illuminant A to approximate direct solar radiation. Now obsolete and replaced by the D-series, but retained for legacy colorimetric data.",
	C: "C - Historical 'average daylight' (north-sky) with a correlated color temperature of 6774 K. Derived by filtering Illuminant A with liquid filters. While it simulates daylight better than A, it lacks the UV content of the D-series and has largely been superseded by D65.",

	D40: "D40 - CIE D-series daylight approximation at 4000 K. Represents a warm daylight phase, similar to early morning or late afternoon sun. Often used as a reference for warm-white LED specifications requiring a daylight curve locus.",
	D50: "D50 - Standard CIE daylight with a correlated color temperature of 5003 K. The primary reference for the printing industry (ISO 3664), graphic arts and ICC Profile connection spaces (PCS). It represents 'horizon light' and appears warmer than D65.",
	D55: "D55 - CIE D-series daylight with a correlated color temperature of 5503 K. Represents mid-morning or mid-afternoon daylight. Historically used as the standard for photographic film balancing and some graphic arts applications.",
	D60: "D60 - CIE D-series daylight approximation at 6000 K. While not a formal CIE standard, this specific white point is the reference for the ACES (Academy Color Encoding System) workflow and is used extensively in cinema and VFX.",
	D65: "D65 - Standard CIE daylight with a correlated color temperature of 6504 K. The standard representation of average noon daylight (including UV components). It is the reference white for sRGB, Rec.709, Rec.2020 and most digital display interconnects.",
	D75: "D75 - CIE D-series daylight with a correlated color temperature of 7504 K. Represents a distinct 'North Sky' daylight. Used in applications requiring a cooler daylight reference than D65, such as specific textile or agricultural grading.",

	E: "E - Equal-energy white point with a theoretical CCT of ~5454 K. Defined by a flat spectral power distribution (constant energy per wavelength). It is the geometric center of the CIE chromaticity diagram (x=1/3, y=1/3) used for mathematical normalization.",

	F2: "F2 - Cool White Fluorescent (CWF) with a correlated color temperature of 4230 K. Represents standard office fluorescent lighting using halophosphate phosphors. Features distinct mercury spectral lines and is used to test metamerism in retail environments.",
	F7: "F7 - Broad-band Daylight Fluorescent with a correlated color temperature of 6500 K. A daylight simulator using a mixture of phosphors to approximate the D65 spectrum more closely than standard fluorescents. High Color Rendering Index (CRI).",
	F11: "F11 - Narrow-band White Fluorescent (TL84) with a correlated color temperature of 4000 K. Represents modern tri-band fluorescent efficiency lighting appearing in retail stores (e.g., Marks & Spencer). Known for distinct spikes in R/G/B regions.",

	ID50: "ID50 - Indoor Daylight (CIE 015:2018) with a correlated color temperature of ~5098 K. Represents daylight filtered through window glass, resulting in a slightly different spectral curve than standard D50. Relevant for interior architectural lighting.",
	ID65: "ID65 - Indoor Daylight (CIE 015:2018) with a correlated color temperature of ~6603 K. Represents D65 daylight filtered through standard window glass. Used for evaluating object color appearance in typical indoor environments.",

	LEDB1: "LED-B1 - CIE 015:2018 Standard LED (Phosphor-converted Blue) at ~2733 K. Represents a typical warm-white LED source. Part of the modern CIE series to address the spectral spikiness of solid-state lighting.",
	LEDB2: "LED-B2 - CIE 015:2018 Standard LED (Phosphor-converted Blue) at ~2998 K. Represents a warm-white LED source, slightly cooler than B1, often used in residential lighting.",
	LEDB3: "LED-B3 - CIE 015:2018 Standard LED (Phosphor-converted Blue) at ~4103 K. Represents a neutral-white LED source commonly used in office environments.",
	LEDB4: "LED-B4 - CIE 015:2018 Standard LED (Phosphor-converted Blue) at ~5109 K. Represents a cool-white LED source, often used in commercial or industrial settings.",
	LEDB5: "LED-B5 - CIE 015:2018 Standard LED (Phosphor-converted Blue) at ~6598 K. Represents a cool-white daylight LED source.",
};

// Precise CCT values for D-Series calculation (CIE 15:2004 / ASTM E308)
const CCT = {
	A: 2856,
	D40: 4000,
	D50: 5003,
	D55: 5503,
	D60: 6000,
	D65: 6504,
	D70: 7000,
	D75: 7504,
};

const Chroma2 = {
	A: calculatePlanckian_xy(CCT.A),
	B: [0.34842, 0.35161],
	C: [0.31006, 0.31616],

	D40: calculateDaylight_xy(CCT.D40),
	D50: calculateDaylight_xy(CCT.D50),
	D55: calculateDaylight_xy(CCT.D55),
	D60: calculateDaylight_xy(CCT.D60),
	D65: calculateDaylight_xy(CCT.D65),
	D70: calculateDaylight_xy(CCT.D70),
	D75: calculateDaylight_xy(CCT.D75),

	E: [1.0 / 3.0, 1.0 / 3.0],

	F2: [0.37208, 0.37529],
	F7: [0.31292, 0.32933],
	F11: [0.38052, 0.37713],

	ID50: [0.3432, 0.3602],
	ID65: [0.3107, 0.3307],

	LEDB1: [0.456, 0.4078],
	LEDB2: [0.4357, 0.4012],
	LEDB3: [0.3756, 0.3723],
	LEDB4: [0.3422, 0.3502],
	LEDB5: [0.3118, 0.3236],
};

const Chroma10 = {
	A: [0.45117, 0.40594],
	B: [0.3498, 0.3527],
	C: [0.31039, 0.31905],

	D40: [0.38716, 0.39096],
	D50: [0.34773, 0.35952],
	D55: [0.33411, 0.34877],
	D60: [0.32296, 0.33914],
	D65: [0.31382, 0.331],
	D70: [0.30535, 0.32788],
	D75: [0.29968, 0.3174],

	E: [1.0 / 3.0, 1.0 / 3.0],

	F2: [0.37925, 0.36733],
	F7: [0.31569, 0.3296],
	F11: [0.38541, 0.37123],

	ID50: [0.3491, 0.3634],
	ID65: [0.3159, 0.3343],

	LEDB1: [0.46, 0.4053],
	LEDB2: [0.4402, 0.3995],
	LEDB3: [0.3806, 0.3721],
	LEDB4: [0.3463, 0.3516],
	LEDB5: [0.3157, 0.3262],
};

function buildXYZ(chroma) {
	const out = {};

	for (const [name, [x, y]] of Object.entries(chroma)) {
		out[name] = xyToXyzY1(x, y);
	}

	return out;
}

const WhitepointsXYZ = {
	["2"]: buildXYZ(Chroma2),
	["10"]: buildXYZ(Chroma10),
};

export function getWhitepointXYZ(name, observer) {
	const table = WhitepointsXYZ[observer];

	return table[name] || table.D65;
}

export function getWhitepointNames() {
	return Object.keys(descriptions);
}

export function getObserverNames() {
	return Object.keys(WhitepointsXYZ);
}
