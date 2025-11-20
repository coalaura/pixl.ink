function xyToXyzY1(x, y) {
	if (y === 0) {
		return [0, 0, 0];
	}

	const X = x / y,
		Y = 1.0,
		Z = (1 - x - y) / y;

	return [X, Y, Z];
}

export const descriptions = {
	A: "A - Incandescent/tungsten reference illuminant with a correlated color temperature of 2856 K. Defined by CIE in 1931 using a gas-filled coiled-tungsten filament. It appears very warm (yellow-orange) and remains the primary standard for indoor lighting calibration.",
	B: "B - Historical 'noon sunlight' illuminant with a correlated color temperature of 4874 K. Derived by filtering Illuminant A to approximate direct solar radiation. Now obsolete and replaced by the D-series, but retained for legacy colorimetric data.",
	C: "C - Historical 'average daylight' (north-sky) with a correlated color temperature of 6774 K. Derived by filtering Illuminant A with liquid filters. While it simulates daylight better than A, it lacks the UV content of the D-series and has largely been superseded by D65.",

	D40: "D40 - CIE D-series daylight approximation at 4000 K. Represents a warm daylight phase, similar to early morning or late afternoon sun. Often used as a reference for warm-white LED specifications requiring a daylight curve locus.",
	D50: "D50 - Standard CIE daylight with a correlated color temperature of 5003 K. The primary reference for the printing industry (ISO 3664), graphic arts, and ICC Profile connection spaces (PCS). It represents 'horizon light' and appears warmer than D65.",
	D55: "D55 - CIE D-series daylight with a correlated color temperature of 5503 K. Represents mid-morning or mid-afternoon daylight. historically used as the standard for photographic film balancing and some graphic arts applications.",
	D60: "D60 - CIE D-series daylight approximation at 6000 K. While not a standard CIE illuminant, this specific white point is the reference for the ACES (Academy Color Encoding System) workflow and is used extensively in cinema and VFX.",
	D65: "D65 - Standard CIE daylight with a correlated color temperature of 6504 K. The standard representation of average noon daylight (including UV components). It is the reference white for sRGB, Rec.709, Rec.2020, and most digital display interconnects.",
	D70: "D70 - CIE D-series daylight approximation at 7000 K. Represents a cooler daylight phase, typical of overcast skies or north-sky illumination. Used occasionally in specific industrial color matching applications requiring higher Kelvin temperatures.",

	E: "E - Equal-energy white point with a theoretical CCT of ~5454 K. Defined by a flat spectral power distribution (constant energy per wavelength). It is the geometric center of the CIE chromaticity diagram (x=1/3, y=1/3) used for mathematical normalization.",

	F2: "F2 - Cool White Fluorescent (CWF) with a correlated color temperature of 4230 K. Represents standard office fluorescent lighting using halophosphate phosphors. Features distinct mercury spectral lines and is used to test metamerism in retail environments.",
	F7: "F7 - Broad-band Daylight Fluorescent with a correlated color temperature of 6500 K. A daylight simulator using a mixture of phosphors to approximate the D65 spectrum more closely than standard fluorescents. High Color Rendering Index (CRI).",
	F11: "F11 - Narrow-band White Fluorescent (TL84) with a correlated color temperature of 4000 K. Represents modern tri-band fluorescent efficiency lighting appearing in retail stores (e.g., Marks & Spencer). Known for distinct spikes in R/G/B regions.",
};

const Chroma2 = {
	A: [0.44757, 0.40745],
	B: [0.34842, 0.35161],
	C: [0.31006, 0.31616],

	D40: [0.38237, 0.38365],
	D50: [0.34567, 0.3585],
	D55: [0.33242, 0.34743],
	D60: [0.32168, 0.33767],
	D65: [0.31271, 0.32902],
	D70: [0.30579, 0.325],

	E: [1.0 / 3.0, 1.0 / 3.0],

	F2: [0.37208, 0.37529],
	F7: [0.31292, 0.32933],
	F11: [0.38052, 0.37713],
};

const Chroma10 = {
	A: [0.45117, 0.40594],
	B: [0.3498, 0.3527],
	C: [0.31039, 0.31905],

	D40: [0.38716, 0.39096],
	D50: [0.34773, 0.35952],
	D55: [0.33411, 0.34877],
	D60: [0.322957407931312, 0.339135835524579],
	D65: [0.31382, 0.331],
	D70: [0.30535, 0.32788],

	E: [1.0 / 3.0, 1.0 / 3.0],

	F2: [0.37925, 0.36733],
	F7: [0.31569, 0.3296],
	F11: [0.38541, 0.37123],
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
