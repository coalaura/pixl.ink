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
	A: "A - Incandescent/tungsten reference illuminant with a correlated color temperature ~ 2856 K. Represents a Planckian radiator and appears very warm (yellow-orange). Historically used for film and indoor lighting calibration; still relevant for evaluating warm light sources.",
	B: "B - Historical 'noon sunlight' illuminant with a correlated color temperature ~ 4874 K. Realized by filtering Illuminant A to mimic daylight; now considered obsolete and replaced by the CIE D-series. Kept mainly for legacy colorimetry and comparison studies.",
	C: "C - Historical 'average daylight' (often associated with north-sky daylight). A theoretical construct derived by filtering Illuminant A to approximate daylight; superseded by CIE D-series illuminants. Useful in legacy data and some academic references.",

	D40: "D40 - CIE D-series daylight at ~ 4000 K. Represents a warm, low-CCT daylight (similar to early morning or late afternoon) and is sometimes used to characterize warm white LEDs and mixed daylight/tungsten conditions.",
	D50: "D50 - Standard daylight (CIE D-series) with a correlated color temperature ~ 5003 K. Widely used in print and color management (ICC profiles, ISO 3664 viewing conditions) as the reference white for soft-proofing and hard-proofing. It appears slightly warm compared to D65.",
	D55: "D55 - Daylight (CIE D-series) with a correlated color temperature ~ 5500 K. Historically common in photography as a 'daylight' film balance and studio lighting reference. Slightly warmer than D65, often perceived as neutral-warm daylight in mid-morning/afternoon conditions.",
	D60: "D60 - Daylight-like (CIE D-series extrapolated) with a correlated color temperature ~ 6000 K. Not a formal CIE standard, but widely used in cinema/VFX (e.g. ACES working spaces) as a practical neutral white between D55 and D65.",
	D65: "D65 - Standard daylight (CIE D-series) with a correlated color temperature ~ 6504 K. The de facto reference white for sRGB, Rec.709, many display RGB spaces, and general imaging. Perceived as cool-neutral average daylight.",
	D70: "D70 - CIE D-series daylight at ~ 7000 K. Represents a cooler daylight condition (overcast sky or north-sky illumination) and is occasionally used for evaluating cool daylight viewing conditions or high-CCT LED lighting.",

	E: "E - Equal-energy white point (theoretical), defined by a flat spectral power distribution where all visible wavelengths are equally represented. Not a physical daylight source but a useful reference in color calculations and comparisons. Chromaticity is exactly x=1/3, y=1/3 (~ 0.3333, 0.3333).",

	F2: "F2 - Fluorescent (cool white) with a correlated color temperature ~ 4230 K. Common office lighting with pronounced spectral line peaks due to phosphors. Often used to assess metamerism under cool fluorescent conditions.",
	F7: "F7 - Fluorescent (broad-band) daylight simulator with a correlated color temperature ~ 6500 K. Designed to approximate D65 using a phosphor mix; used in viewing booths and lighting evaluations. Its line-rich spectrum differs from continuous daylight.",
	F11: "F11 - Fluorescent (narrow tri-band, e.g., TL84) with a correlated color temperature ~ 4000 K. Common in retail/office environments; features strong narrow-band R/G/B phosphor peaks, which can induce metamerism issues.",
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
