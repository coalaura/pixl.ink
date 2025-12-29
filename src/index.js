import { foregroundColor } from "./contrast.js";
import { modes, simulateCvdSrgbGamma } from "./cvd.js";
import { generatePalette } from "./palette.js";
import { isWithinHumanPerception, SPECTRAL_LOCUS_XY } from "./perception.js";

import aces2065 from "./spaces/aces2065.js";
import acescc from "./spaces/acescc.js";
import acescct from "./spaces/acescct.js";
import acescg from "./spaces/acescg.js";
import adobergb from "./spaces/adobergb.js";
import adobewidegamut from "./spaces/adobewidegamut.js";
import deepseek_32 from "./spaces/ai/deepseek_32.js";
import gemini_25 from "./spaces/ai/gemini_25.js";
import gpt_5 from "./spaces/ai/gpt_5.js";
import grok_4 from "./spaces/ai/grok_4.js";
import haiku_45 from "./spaces/ai/haiku_45.js";
import kimi_k2 from "./spaces/ai/kimi_k2.js";
import applergb from "./spaces/applergb.js";
import arriwidegamut3 from "./spaces/arriwidegamut3.js";
import arriwidegamut4 from "./spaces/arriwidegamut4.js";
import cam02 from "./spaces/cam02.js";
import cam02ucs from "./spaces/cam02ucs.js";
import cam02ucsjch from "./spaces/cam02ucsjch.js";
import cam16 from "./spaces/cam16.js";
import cam16ucs from "./spaces/cam16ucs.js";
import cam16ucsjch from "./spaces/cam16ucsjch.js";
import canoncinemagamut from "./spaces/canoncinemagamut.js";
import cielab from "./spaces/cielab.js";
import cielch from "./spaces/cielch.js";
import cieluv from "./spaces/cieluv.js";
import ciergb from "./spaces/ciergb.js";
import cieucs from "./spaces/cieucs.js";
import cieuvw from "./spaces/cieuvw.js";
import cmyk from "./spaces/cmyk.js";
import cubehelix from "./spaces/cubehelix.js";
import dcip3 from "./spaces/dcip3.js";
import din99 from "./spaces/din99.js";
import din99o from "./spaces/din99o.js";
import displayp3 from "./spaces/displayp3.js";
import dkl from "./spaces/dkl.js";
import dklss from "./spaces/dklss.js";
import ecirgbv2 from "./spaces/ecirgbv2.js";
import hct from "./spaces/hct.js";
import hellwig from "./spaces/hellwig.js";
import hpluv from "./spaces/hpluv.js";
import hsi from "./spaces/hsi.js";
import hsl from "./spaces/hsl.js";
import hsluv from "./spaces/hsluv.js";
import hsm from "./spaces/hsm.js";
import hsp from "./spaces/hsp.js";
import hsv from "./spaces/hsv.js";
import hunterlab from "./spaces/hunterlab.js";
import hunterrdab from "./spaces/hunterrdab.js";
import hwb from "./spaces/hwb.js";
import icacb from "./spaces/icacb.js";
import ictcp from "./spaces/ictcp.js";
import igpgtg from "./spaces/igpgtg.js";
import ihls from "./spaces/ihls.js";
import ipt from "./spaces/ipt.js";
import jzazbz from "./spaces/jzazbz.js";
import jzczhz from "./spaces/jzczhz.js";
import kubelkamunk from "./spaces/kubelkamunk.js";
import linearrgb from "./spaces/linearrgb.js";
import lms from "./spaces/lms.js";
import lms2006 from "./spaces/lms2006.js";
import munsell from "./spaces/munsell.js";
import ncs from "./spaces/ncs.js";
import ntsc from "./spaces/ntsc.js";
import okhsl from "./spaces/okhsl.js";
import okhsv from "./spaces/okhsv.js";
import oklab from "./spaces/oklab.js";
import oklch from "./spaces/oklch.js";
import oklrab from "./spaces/oklrab.js";
import oklrch from "./spaces/oklrch.js";
import orgb from "./spaces/orgb.js";
import prismatic from "./spaces/prismatic.js";
import prolab from "./spaces/prolab.js";
import prophoto from "./spaces/prophoto.js";
import rec601 from "./spaces/rec601.js";
import rec709 from "./spaces/rec709.js";
import rec2020 from "./spaces/rec2020.js";
import rec2100hlg from "./spaces/rec2100hlg.js";
import rec2100pq from "./spaces/rec2100pq.js";
import redwidegamut from "./spaces/redwidegamut.js";
import rlab from "./spaces/rlab.js";
import ryb from "./spaces/ryb.js";
import scrgb from "./spaces/scrgb.js";
import sgamut3 from "./spaces/sgamut3.js";
import sgamut3cine from "./spaces/sgamut3cine.js";
import smpte240m from "./spaces/smpte240m.js";
import srgb from "./spaces/srgb.js";
import srlab2 from "./spaces/srlab2.js";
import tsl from "./spaces/tsl.js";
import vgamut from "./spaces/vgamut.js";
import xvycc from "./spaces/xvycc.js";
import xyb from "./spaces/xyb.js";
import xyy from "./spaces/xyy.js";
import xyz from "./spaces/xyz.js";
import ycbcr from "./spaces/ycbcr.js";
import ycocg from "./spaces/ycocg.js";
import ydbdr from "./spaces/ydbdr.js";
import yes from "./spaces/yes.js";
import yiq from "./spaces/yiq.js";
import ypbpr from "./spaces/ypbpr.js";
import zcam from "./spaces/zcam.js";

import { descriptions } from "./whites/points.js";

export const whites = {
	descriptions: descriptions,
};

export const cvd = {
	modes: modes,
	simulate: simulateCvdSrgbGamma,
};

export const isColorPerceivable = isWithinHumanPerception;
export const getForegroundColor = foregroundColor;

export const createPalette = generatePalette;

export const SPECTRAL_LOCUS = SPECTRAL_LOCUS_XY;

export const spaces = {
	// Base
	xyz: xyz,

	// Experimental
	gemini_25: gemini_25,
	grok_4: grok_4,
	haiku_45: haiku_45,
	kimi_k2: kimi_k2,
	gpt_5: gpt_5,
	deepseek_32: deepseek_32,

	// Normal
	aces2065: aces2065,
	acescc: acescc,
	acescct: acescct,
	acescg: acescg,
	adobergb: adobergb,
	adobewidegamut: adobewidegamut,
	applergb: applergb,
	arriwidegamut3: arriwidegamut3,
	arriwidegamut4: arriwidegamut4,
	cam02: cam02,
	cam02ucs: cam02ucs,
	cam02ucsjch: cam02ucsjch,
	cam16: cam16,
	cam16ucs: cam16ucs,
	cam16ucsjch: cam16ucsjch,
	canoncinemagamut: canoncinemagamut,
	cielab: cielab,
	cielch: cielch,
	cieluv: cieluv,
	ciergb: ciergb,
	cieucs: cieucs,
	cieuvw: cieuvw,
	cmyk: cmyk,
	cubehelix: cubehelix,
	dcip3: dcip3,
	din99: din99,
	din99o: din99o,
	displayp3: displayp3,
	dkl: dkl,
	dklss: dklss,
	ecirgbv2: ecirgbv2,
	hct: hct,
	hellwig: hellwig,
	hpluv: hpluv,
	hsi: hsi,
	hsl: hsl,
	hsluv: hsluv,
	hsm: hsm,
	hsp: hsp,
	hsv: hsv,
	hunterlab: hunterlab,
	hunterrdab: hunterrdab,
	hwb: hwb,
	icacb: icacb,
	ictcp: ictcp,
	igpgtg: igpgtg,
	ihls: ihls,
	ipt: ipt,
	jzazbz: jzazbz,
	jzczhz: jzczhz,
	kubelkamunk: kubelkamunk,
	linearrgb: linearrgb,
	lms: lms,
	lms2006: lms2006,
	munsell: munsell,
	ncs: ncs,
	ntsc: ntsc,
	okhsl: okhsl,
	okhsv: okhsv,
	oklab: oklab,
	oklch: oklch,
	oklrab: oklrab,
	oklrch: oklrch,
	orgb: orgb,
	prismatic: prismatic,
	prolab: prolab,
	prophoto: prophoto,
	rec2020: rec2020,
	rec2100hlg: rec2100hlg,
	rec2100pq: rec2100pq,
	rec601: rec601,
	rec709: rec709,
	redwidegamut: redwidegamut,
	rlab: rlab,
	ryb: ryb,
	scrgb: scrgb,
	sgamut3: sgamut3,
	sgamut3cine: sgamut3cine,
	smpte240m: smpte240m,
	srgb: srgb,
	srlab2: srlab2,
	tsl: tsl,
	vgamut: vgamut,
	xvycc: xvycc,
	xyb: xyb,
	xyy: xyy,
	ycbcr: ycbcr,
	ycocg: ycocg,
	ydbdr: ydbdr,
	yes: yes,
	yiq: yiq,
	ypbpr: ypbpr,
	zcam: zcam,
};

export const symbols = {
	// Experimental
	cp: "𝑐𝑝", // Kimi-Resonance
	cr: "𝑐𝑟", // Grok-Resonance
	ct: "𝑐𝑡", // GPT-Vorticolor
	dc: "𝑑𝑐", // Gemini-Temporal
	en: "𝑒𝑛", // Gemini-Temporal
	es: "𝑒𝑠", // Kimi-Resonance
	ff: "𝑓𝑓", // DeepSeek-Resonance
	hs: "ℎ𝑠", // DeepSeek-Resonance
	it: "𝑖𝑡", // Grok-Resonance
	os: "𝑜𝑠", // Gemini-Temporal
	qf: "𝑞𝑓", // Kimi-Resonance
	r1: "𝑟¹", // Haiku-Fibonacci
	r2: "𝑟²", // Haiku-Fibonacci
	r3: "𝑟³", // Haiku-Fibonacci
	rd: "𝑟𝑑", // DeepSeek-Resonance
	sr: "𝑠𝑟", // GPT-Vorticolor
	vf: "𝑣𝑓", // GPT-Vorticolor
	wr: "𝑤𝑟", // Grok-Resonance

	// Normal
	a: "𝑎", // Opponent color dimension (Lab)
	Az: "𝐴𝑧", // Red-Green (JzAzBz)
	b: "𝑏", // Blue (used in RGB, HWB, Lab, etc.)
	by: "𝑏𝑦", // Blue–Yellow opponent (DKL)
	Bz: "𝐵𝑧", // Yellow–Blue (JzAzBz)
	c: "𝑐", // Cyan
	Ca: "𝐶𝑎", // Chrominance a (ICaCb)
	Cb: "𝐶𝑏", // Chrominance blue (YCbCr)
	Cg: "𝐶𝑔", // Chroma green (YCoCg)
	Co: "𝐶𝑜", // Chroma orange (YCoCg)
	Cp: "𝐶𝑝", // Chroma Protan (ICtCp)
	Cr: "𝐶𝑟", // Chrominance red (YCbCr)
	crg: "𝑐𝑟𝑔", // Red-Green (oRGB)
	Ct: "𝐶𝑡", // Chroma Tritan (ICtCp)
	cyb: "𝑐𝑦𝑏", // Yellow-Blue (oRGB)
	Cz: "𝐶𝑧", // Chroma (JzCzHz)
	Db: "𝐷𝑏", // Chroma Blue-Diff (YDbDr)
	Dr: "𝐷𝑟", // Chroma Red-Diff (YDbDr)
	e: "𝑒", // E-factor (YES)
	g: "𝑔", // Green
	h: "ℎ", // Hue (HSL, HSV, HWB, HSI) — Unicode italic h
	Hz: "𝐻𝑧", // Hue Angle (JzCzHz)
	i: "𝑖", // Intensity (HSI, IPT)
	I: "𝐼", // Intensity (ICtCp, IPT)
	Ig: "𝐼𝑔", // Intensity (IgPgTg)
	j: "𝑗", // Lightness (CAM16)
	Jz: "𝐽𝑧", // Lightness (JzAzBz)
	k: "𝑘", // Black (CMYK)
	kb: "𝑘𝑏", // Absorption B (Kubelka-Munk)
	kg: "𝑘𝑔", // Absorption G (Kubelka-Munk)
	kr: "𝑘𝑟", // Absorption R (Kubelka-Munk)
	l: "𝑙", // Lightness (HSL, Lab)
	lum: "𝐿", // Luminance (DKL)
	m: "𝑚", // Magenta
	Mz: "𝑀𝑧", // Colorfulness Mz (ZCAM)
	p: "𝑝", // Perceived Brightness (HSP)
	P: "𝑃", // Protan (IPT)
	Pb: "𝑃𝑏", // Chroma Blue-Diff (YPbPr)
	Pg: "𝑃𝑔", // Protan in IgPgTg
	Pr: "𝑃𝑟", // Chroma Red-Diff (YPbPr)
	q: "𝑞", // Quadrature (YIQ)
	r: "𝑟", // Red
	Rd: "𝑅𝑑", // Luminance Rd (Hunter RDab)
	rg: "𝑟𝑔", // Red–Green opponent (DKL)
	S: "𝑆", // S-factor (YES)
	s: "𝑠", // Saturation (HSL, HSV, HSI)
	t: "𝑡", // Tint (TSL)
	T: "𝑇", // Tritan (IPT)
	Tg: "𝑇𝑔", // Tritan in IgPgTg
	u: "𝑢", // U channel (UCS)
	v: "𝑣", // V channel (UCS)
	w: "𝑤", // Whiteness (HWB)
	x: "𝑥", // Chromaticity x (xyY)
	Y: "𝑌", // Luminance (xyY)
	y: "𝑦", // Yellow (CMYK, xyY, etc.)
	z: "𝑧", // Chromaticity z (XYZ)
};

export const tags = {
	fundamental: {
		label: "Fundamental",
		description: "Direct coordinate systems derived from XYZ that form the basis of other spaces.",
	},
	chromaticity: {
		label: "Chromaticity",
		description: "Shows colors via normalized chromaticity coordinates (u, v, x, y) plus luminance.",
	},
	device_rgb: {
		label: "Device RGB",
		description: "Practical RGB working spaces or standards defined by real-world primaries/whitepoints.",
	},
	transfer_encoding: {
		label: "Transfer",
		description: "Color encodings that apply a specific transfer curve (gamma, PQ, HLG, YCbCr, etc.).",
	},
	wide_gamut: {
		label: "Wide Gamut",
		description: "Primaries extend beyond sRGB coverage; useful for HDR/VFX pipelines.",
	},
	hdr: {
		label: "HDR",
		description: "Designed for high dynamic range signals or viewing conditions (PQ/HLG, ICtCp, ZCAM, etc.).",
	},
	perceptual_uniform: {
		label: "Perceptual",
		description: "Distances approximately match perceived color differences (Lab, Luv, UVW, OKLab, CAM-UCS, etc.).",
	},
	appearance_model: {
		label: "Appearance",
		description: "Full color-appearance models that account for viewing conditions (CAM02, CAM16, Hellwig, ZCAM).",
	},
	cylindrical_model: {
		label: "Hue/Sat Model",
		description: "Cylindrical hue-saturation-lightness/value models for intuitive editing.",
	},
	opponent_space: {
		label: "Opponent",
		description: "Opponent-axis or LMS-based spaces (IPT, IgPgTg, ICtCp, DKL, YES, etc.).",
	},
	log_curve: {
		label: "Log",
		description: "Logarithmic or quasi-log encodings (ACEScc, ACEScct, log film encodings).",
	},
	notation_system: {
		label: "Notation",
		description: "Color-order systems or notations (e.g., Munsell).",
	},
	ui_model: {
		label: "UI Model",
		description: "Friendly UI-centric transforms (HSL/HSV/HWB, Prismatic, RYB, etc.).",
	},
	experimental_model: {
		label: "Experimental",
		description: "Spaces marked experimental; treat as exploratory.",
	},
};
