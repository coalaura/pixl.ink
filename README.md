# Color Encyclopedia

A battery-included color space / color model library for JavaScript.

- Dozens of RGB spaces (sRGB, Rec.709/2020, Display-P3, Adobe RGB, ACES, camera gamuts, ...)
- Perceptual spaces (CIELAB/LCh, CIELUV, DIN99/99o, OKLab/OKLCh, ProLab, SRLab2, ...)
- Appearance models (CAM02, CAM16, Hellwig 2022, ZCAM)
- HDR encodings (ICtCp, ICaCb, JzAzBz/JzCzHz, Rec.2100 PQ/HLG, scRGB, XYB, ...)
- UI-oriented models (HSL/HSV/HWB/HSI, OKHSL/OKHSV, HPLuv/HSLuv, RYB, Prismatic, NCS, ...)
- Notation systems and chromaticity spaces (Munsell, NCS, xyY, CIE 1960 UCS, UVW, ...)
- Color-vision simulation, perceptibility checks, whitepoint utilities

You can see the library in action in the color picker/encyclopedia at: https://pixl.ink/

---

## Installation

```bash
npm install pixl.ink
```

This package has a single runtime dependency:

- [`munsell`](https://www.npmjs.com/package/munsell)

---

## Quick start

```js
import { spaces } from "pixl.ink";

// sRGB (gamma-encoded) -> XYZ
const redXyz = spaces.srgb.from({ r: 1, g: 0, b: 0 });

// XYZ -> OKLCh (perceptual polar space)
const oklch = spaces.oklch.to(redXyz);
// { l: ~0.628, c: ~0.644, h: ~0.081 }   (all normalized, see below)

// Modify chroma & convert back to sRGB
const moreChroma = { ...oklch, c: Math.min(oklch.c * 1.2, 1) };
const xyz2 = spaces.oklch.from(moreChroma);
const srgb2 = spaces.srgb.to(xyz2);
// srgb2 = { r: 1, g: ~0.1, b: ~0.0 }

// Format as CSS color()
const css = spaces.displayp3.format(
  spaces.displayp3.to(xyz2)
);
// "color(display-p3 0.942 0.184 0.108)"
```

Key idea: **every conversion goes through CIE 1931 XYZ (D65 / 2°)**. You never call XYZ yourself unless you want to.

---

## Core exports

From the package root (`index.js`):

```js
import {
  spaces,
  cvd,
  whites,
  isColorPerceivable,
  getForegroundColor,
  SPECTRAL_LOCUS,
  symbols,
  tags,
} from "pixl.ink";
```

### `spaces`

`spaces` is a map of all implemented spaces:

```js
Object.keys(spaces);
// ["xyz", "srgb", "rec709", "rec2020", "oklab", "oklch", "cam16", "jzazbz", ...]
```

Each entry is a **space object** of the form:

```ts
type Space = {
  name: string;           // short human-readable name
  long: string;           // long description
  css: string;            // CSS identifier where applicable
  tags: string[];         // categories, e.g. ["device_rgb", "wide_gamut"]
  base?: string;          // lineage, e.g. "CIE 1931 XYZ"

  ui: Record<string, {
    from: number;
    to: number;
    step: number;
    round: number;
    name: string;
    primary?: boolean;
  }>;

  // optional
  options?: Record<string, OptionSpec>;
  bake?: (provided?: Partial<Options>) => any;
  format?: (native: any) => string;
  expected?: Record<string, any>;
  lossy?: boolean;
  unbounded?: boolean;

  // conversions (see next section)
  from(native: any, out?: XYZ, params?: any): XYZ;
  to(xyz: XYZ, out?: any, unclamped?: boolean, params?: any): any;
};
```

---

## Space API: `from` / `to`

Every space provides the same basic API:

- `space.from(native, out?) -> xyz`
- `space.to(xyz, out?, unclamped?, params?) -> native`

Where:

- **`native`** = the space's own coordinate object:
  - sRGB: `{ r, g, b }`
  - CIELAB: `{ l, a, b }` (normalized)
  - OKLCh: `{ l, c, h }` (normalized)
  - etc.
- **`xyz`** = `{ x, y, z }` in the **fixed D65 / 2°** intermediate.
- `out` is optional and lets you reuse objects / arrays.
- `unclamped` (bool) controls whether `to()` clamps channels to `[0,1]`.
- `params` is an optional baked parameter object for configurable spaces (see below).

Example: XYZ -> CAM16 JMh with custom viewing conditions:

```js
const cam16 = spaces.cam16;

// 1) Bake viewing conditions
const params = cam16.bake({
  whitepoint: "D65",
  observer: "2",
  adaptingLuminance: 64 / Math.PI * 0.2,
  backgroundLuminance: 20,
  surround: "average",
  discounting: false,
});

// 2) Convert XYZ -> CAM16
const jmh = cam16.to(xyz, {}, true, params);
//  jmh = { j, m, h } in [0,1] transport units

// 3) Back to XYZ
const xyzBack = cam16.from(jmh, {}, params);
```

---

## Transport normalization & transfer encoding

### 1. Transport normalization (0-1 channels)

**All `to()` and `from()` methods work on normalized channels in `[0,1]`**, regardless of the physical units in the spec.

Examples:

- **CIELAB**
  - Spec units: `L* ∈ [0,100]`, `a*,b* ~ [-130,130]`.
  - Library units:
    - `lab.l` is `L*/100`
    - `lab.a` is `(a* / 260) + 0.5`
    - `lab.b` is `(b* / 260) + 0.5`

  ```js
  // Neutral gray L* = 50, a* = 0, b* = 0
  const lab = spaces.cielab.to(xyz);
  // lab ~ { l: 0.5, a: 0.5, b: 0.5 }

  const realL = lab.l * 100;
  const reala = (lab.a - 0.5) * 260;
  const realb = (lab.b - 0.5) * 260;
  ```

- **OKLCh**
  - Spec: `L ∈ [0,1]`, `C` roughly `[0,0.4]`, `h` in degrees.
  - Library:
    - `l` is unchanged
    - `c` is `C / 0.4`
    - `h` is `hDeg / 360`

- **sRGB**
  - Spec: R'G'B' in `[0,1]` gamma-encoded.
  - Library: inputs/outputs are `[0,1]` as well.

The **`ui` ranges** are metadata for tools built on top (like the demo at https://pixl.ink/) and do _not_ change the math. They describe how to present each channel (ranges, steps, display precision), not what `from`/`to` accept.

### 2. Transfer functions (TRCs, log curves, HDR encodings)

Spaces that are **not linear** (sRGB, Rec.709, AdobeRGB, ACEScc, log encodings, PQ/HLG, etc.) **bake the transfer function into `from`/`to`**:

- **Device RGB with gamma/segment TRCs**

  ```js
  // Rec.709 encoded RGB -> XYZ
  const xyz709 = spaces.rec709.from({ r: 0.5, g: 0.5, b: 0.5 });
  // internally:
  //   - rec709ToLinear() per channel
  //   - multiply by Rec.709 primaries -> XYZ

  // XYZ -> encoded Rec.709
  const rgb709 = spaces.rec709.to(xyz709);
  // internally:
  //   - XYZ -> linear RGB
  //   - linearToRec709() per channel
  ```

- **ACEScc / ACEScct**

  These are log encodings of ACES AP1 linear light:

  ```js
  // ACEScc normalized channels in [0,1]
  const xyzFromAcescc = spaces.acescc.from({ r: 0.5, g: 0.5, b: 0.5 });
  // internally:
  //  - map [0,1] -> code value range [CC_MIN, CC_MAX]
  //  - acesccToLinear()
  //  - AP1 matrix -> XYZ

  const acescc = spaces.acescc.to(xyzFromAcescc);
  //  - XYZ -> AP1 linear
  //  - linearToAcescc()
  //  - map code range back to [0,1]
  ```

- **HDR encodings**

  - `rec2100pq` uses ST.2084 PQ with BT.2020 primaries.
  - `rec2100hlg` uses HLG transfer with BT.2020 primaries.
  - `ictcp`, `icacb`, `jzazbz`, `zcam` combine PQ/HLG, cone/LMS transforms, and opponent axes.

You **never** have to manually gamma-decode or apply PQ/HLG: pass the encoded signal to `from`, get encoded back from `to`.

---

## Clamping, unbounded & lossy spaces

Many `to()` implementations are of the form:

```js
space.to = (xyz, out = {}, unclamped = false, params = defaults) => {
  ...
  out.r = clamp(rawR, 0, 1, unclamped);
  ...
};
```

- `unclamped = false` (default): values are clamped to `[0,1]`.
- `unclamped = true`: no clamping; useful when you want:
  - encoded values outside nominal range (e.g., oversaturated wide-gamut).
  - to inspect how far a color is out of gamut.

Some spaces also have flags:

- `space.unbounded = true`
  Space is conceptually unbounded (e.g. CIE RGB, LMS cones, Kubelka-Munk K/S). Expect values outside `[0,1]` for real data.

- `space.lossy = true`
  Round-trip XYZ -> space -> XYZ isn't exact by design (RYB approximation, NCS, some appearance models).

---

## Configurable spaces: `options` & `bake`

Spaces like CIELAB, CIELUV, CAM02, CAM16, ZCAM, RLAB, HunterLab, etc. support **user-selectable whitepoints, observers and viewing conditions**.

Pattern:

```js
const lab = spaces.cielab;

// Inspect available options
console.log(lab.options);
// { whitepoint: { type: "enum", ... }, observer: { type: "enum", ... } }

// Bake once and reuse
const params = lab.bake({ whitepoint: "D50", observer: "2" });

// Use params for conversions
const labColor = lab.to(xyz, {}, true, params);
const xyzBack = lab.from(labColor, {}, params);
```

Details:

- `options` is a schema:
  - `type: "number" | "boolean" | "enum"`
  - with `min`/`max` or `allowed`, and `default`.
- `bake(providedOptions)`:
  - merges user options with defaults via `resolveOptions`.
  - precomputes matrices and constants (whitepoint XYZ, CAT02/CAT16 adaptation, etc.).
  - returns an opaque `params` object to pass into `from`/`to`.

This keeps the heavy math out of the hot path; you bake once per configuration.

---

## Other helpers

### Color-vision deficiency simulation: `cvd`

```js
import { cvd } from "pixl.ink";

const original = { r: 1, g: 0.5, b: 0 }; // sRGB in [0,1]

// Simulate protanopia
const protan = {};
cvd.simulate(protan, original, "protanopia");

console.log(protan); // adjusted sRGB triple

// Available modes & descriptions
console.log(cvd.modes);
/*
{
  none:        { name, description },
  protanopia:  { ... },
  deuteranopia:{ ... },
  tritanopia:  { ... },
  protanomaly, deuteranomaly, tritanomaly,
  s_cone_monochromacy, l_cone_monochromacy, m_cone_monochromacy,
  achromatopsia, achromatomaly
}
*/
```

- Input and output are **gamma-encoded sRGB** in `[0,1]`.
- Internally, simulation operates in linear RGB / LMS as appropriate.

### Perception & spectral locus

```js
import { isColorPerceivable, SPECTRAL_LOCUS } from "pixl.ink";

const result = isColorPerceivable({ x: 0.3, y: 0.3, z: 0.3 });
/*
{
  isVisible: true | false,
  reason: "Within human perception" | "Outside human visual gamut" | ...
}
*/

// SPECTRAL_LOCUS is an array of [x, y] xy-chromaticity points around the spectral locus.
```

### Foreground text color

```js
import { getForegroundColor } from "pixl.ink";

const bg = { r: 0.2, g: 0.1, b: 0.8 }; // sRGB in [0,1]
const fgName = getForegroundColor(bg); // "white" or "black"
```

This uses WCAG-style relative luminance and contrast ratio to pick a high-contrast foreground.

### Whitepoints

```js
import { whites } from "pixl.ink";

console.log(whites.descriptions.D65);
// "D65 - Standard daylight (CIE D-series) with a correlated color temperature ~ 6504 K..."
```

Underlying utilities (`getWhitepointXYZ`, etc.) live in `./whites/points.js` inside the repo.

---

## Examples

### sRGB -> Display-P3 -> OKLCh

```js
const { srgb, displayp3, oklch } = spaces;

// Hex to XYZ via sRGB
function hexToXyz(hex) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;

  return srgb.from({ r, g, b });
}

const xyz = hexToXyz("#ff00ff");

// XYZ -> Display P3 (encoded)
const p3 = displayp3.to(xyz);
// { r,g,b ∈ [0,1] with sRGB TRC over P3 primaries }

// XYZ -> OKLCh
const lcH = oklch.to(xyz);
// Adjust hue, clamp, etc.
```

### Using unclamped outputs for gamut inspection

```js
// XYZ well outside sRGB
const crazyXyz = { x: 0.7, y: 0.7, z: 0.1 };

const s1 = spaces.srgb.to(crazyXyz);           // clamped by default
const s2 = spaces.srgb.to(crazyXyz, {}, true); // unclamped, may have <0 or >1

console.log(s1, s2);
```

### ACEScg linear pipeline

```js
const { acescg, aces2065, srgb, linearrgb } = spaces;

// sRGB (encoded) -> XYZ -> ACEScg (AP1 linear)
const xyz = srgb.from({ r: 0.8, g: 0.6, b: 0.1 });
const ap1 = acescg.to(xyz);  // linear AP1 RGB

// ACEScg -> ACES 2065-1 (AP0, adapted D60->D65)
const xyzFromAp1 = acescg.from(ap1);
const ap0 = aces2065.to(xyzFromAp1);

// back to linear sRGB
const linearSrgb = linearrgb.to(xyzFromAp1);
```

---

## Tags, symbols & metadata

For tooling or documentation, the library exposes some classification helpers:

```js
import { tags, symbols } from "pixl.ink";

console.log(tags.perceptual_uniform);
// { label: "Perceptual", description: "Distances approximately match perceived color differences ..." }

console.log(symbols.l, symbols.h, symbols.Cz);
// "𝑙", "ℎ", "𝐶𝑧" - useful for axis labels, legends, etc.
```

Each space's `tags` and `base` fields are purely descriptive; they don't change behavior but are handy for building filtered lists or grouped documentation.

---

## Testing & reference data

The repository includes a comprehensive test suite (`index.test.js`) that verifies:

- Every space exports the required fields and functions.
- For spaces with `options`, `bake()` works and returns a parameter object.
- For non-lossy spaces, XYZ -> space -> XYZ round-trips within tolerance.
- `expected` blocks are checked against **independent reference values** for a set of canonical sRGB hex colors.

This is why you see large `expected: { "#FFFFFF": { ... } }` tables in each space file: those are **normalized** transport values used for regression tests, not hand-wavy examples.

---

## Notes & design choices

- **XYZ anchor**: Everything goes through D65/2° CIE XYZ. Spaces with other whites (Rec.601, NTSC, ProPhoto, DCI-P3, etc.) use Bradford or CAT02/CAT16-style adaptation internally.
- **Manual memory management**: Hot-path math uses small object/array pools (`alloc3`/`free3`, etc.) instead of allocating new arrays every time. This gives predictable performance and avoids GC spikes when doing a lot of conversions.
- **No global state**: Viewing conditions and whitepoints are always passed explicitly via `bake()` output. There is no global "set whitepoint" knob that silently changes other spaces.

---

## License & contributions

This library is licensed under **GPL v3.0**. See [LICENSE](LICENSE) for full terms.

If you add a new space:

1. Follow the same `export default { ... }` contract.
2. Implement `from` and `to` against XYZ (D65/2°).
3. Add `ui` metadata and `tags`/`base`.
4. Provide an `expected` table from an independent reference.
5. Run tests.

PRs are welcome.
