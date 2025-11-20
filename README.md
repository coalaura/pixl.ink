# pixl.ink Color Encyclopedia

A high-performance, zero-dependency color space library for JavaScript/TypeScript with manual memory management. Converts between 100+ color spaces through a fixed CIE 1931 XYZ intermediate. See it in action [here](https://pixl.ink/).

**Published on npm as `pixl.ink`**
https://www.npmjs.com/package/pixl.ink

---

## Quick start

```bash
npm install pixl.ink
# or
pnpm add pixl.ink
# or
yarn add pixl.ink
```

```js
import { spaces } from "pixl.ink";

// sRGB (gamma-encoded) → XYZ
const redXyz = spaces.srgb.from({ r: 1, g: 0, b: 0 });

// XYZ → OKLCh (perceptual polar space)
const oklch = spaces.oklch.to(redXyz);
// { l: 0.628, c: 0.644, h: 0.081 }  // all normalized 0-1

// Modify chroma & convert back
const moreChroma = { ...oklch, c: Math.min(oklch.c * 1.2, 1) };
const xyz2 = spaces.oklch.from(moreChroma);
const srgb2 = spaces.srgb.to(xyz2); // { r: 1, g: ~0.1, b: ~0 }

// Format as CSS color()
const css = spaces.displayp3.format(
  spaces.displayp3.to(xyz2)
);
// "color(display-p3 0.942 0.184 0.108)"
```

---

## Core API

### `spaces`

`spaces` is a map of all implemented color spaces:

```js
Object.keys(spaces);
// ["xyz", "srgb", "rec709", "rec2020", "oklab", "oklch", "cam16", "jzazbz", ...]
```

Each space object has:

```ts
type Space = {
  name: string;           // Short name
  long: string;           // Full description
  css: string;            // CSS identifier (e.g., "display-p3")
  tags: string[];         // Categories: "perceptual_uniform", "device_rgb", etc.
  base?: string;          // Parent space lineage

  // Channel metadata (used for UI generation, documentation)
  ui: Record<string, {
    from: number; to: number; step: number; round: number;
    name: string; primary?: boolean;
  }>;

  // Conversions (the important part)
  from(native: object, out?: XYZ, params?: any): XYZ;
  to(xyz: XYZ, out?: object, unclamped?: boolean, params?: any): object;

  // Optional
  options?: object;       // Configuration schema
  bake?: (opts) => params; // Precompute constants for options
  format?: (color) => string; // CSS string output
  expected?: object;      // Reference test data
  lossy?: boolean;        // Round-trip may not be exact
  unbounded?: boolean;    // Values can exceed [0,1]
};
```

### Every conversion goes through XYZ

The library uses **CIE 1931 XYZ (D65 / 2°)** as the canonical intermediate. Spaces with different whitepoints (ProPhoto D50, DCI-P3 theatrical, etc.) handle adaptation internally.

```js
const xyz = spaces.srgb.from({ r: 0.5, g: 0.5, b: 0.5 });
// xyz = { x: 0.205, y: 0.2159, z: 0.235 }

const lab = spaces.cielab.to(xyz);
// lab = { l: 0.5359, a: 0.5, b: 0.5 }  // normalized transport
```

### Transport normalization

**All channel values are normalized to `[0,1]` for the API.** Physical units are scaled:

- **CIELAB**: `L* ∈ [0,100]` → `lab.l ∈ [0,1]`, `a*,b* ∈ [-130,130]` → `lab.a, lab.b ∈ [0,1]`
- **OKLCh**: `C ~ [0,0.4]` → `c ∈ [0,1]`, `h ∈ [0,360]` → `h ∈ [0,1]`
- **sRGB**: Encoded values are already `[0,1]`

To recover physical units:

```js
const realL = lab.l * 100;
const realA = (lab.a - 0.5) * 260;
const realB = (lab.b - 0.5) * 260;
```

The `ui` metadata describes the physical ranges but doesn't affect conversion math.

---

## Performance: Manual memory management

The library is designed for **zero-allocation hot paths**. It uses a pooled allocator for temporary `Float64Array(3)` vectors:

```js
import { alloc3, free3 } from "pixl.ink/pool.js";

// Inside a space's from/to:
const v3 = alloc3();
matmul(v3, MATRIX, x, y, z);
// ... use v3 ...
free3(v3); // returns to pool, no GC
```

**You don't need to call `alloc3`/`free3` yourself** when using `spaces.*` APIs. The library handles it internally. The pool is exposed only if you're building custom conversion pipelines.

This design keeps 60fps animations smooth even when converting thousands of colors per frame.

---

## Clamping behavior

`space.to(xyz, out, unclamped)`:

- **`unclamped = false`** (default): clamps each channel to `[0,1]`
- **`unclamped = true`**: returns raw computed values (may be `<0` or `>1`)

Spaces can also have:

- **`unbounded: true`** - The space definition allows values outside `[0,1]` (e.g., LMS cone excitations, CIE RGB, Kubelka-Munk).
- **`lossy: true`** - Round-trip XYZ → space → XYZ is approximate (e.g., RYB, Munsell, some appearance models).

```js
// Gamut inspection
const outOfGamut = spaces.rec2020.to(xyz, {}, true); // may exceed [0,1]
const clipped = spaces.rec2020.to(xyz, {}, false);   // clamped for display
```

---

## Configurable spaces: `options` & `bake`

Spaces that support variable viewing conditions (CIELAB, CAM16, ZCAM, HunterLab, etc.) use a **baking pattern**:

```js
const space = spaces.cam16;

// 1. Define custom viewing conditions
const params = space.bake({
  whitepoint: "D65",
  observer: "2",
  adaptingLuminance: (64 / Math.PI) * 0.2,
  backgroundLuminance: 20,
  surround: "average",
  discounting: false,
});

// 2. Use params for conversions (cached, fast)
const jmh = space.to(xyz, {}, true, params);
const xyzBack = space.from(jmh, {}, params);
```

- **`options`** declares the schema
- **`bake()`** precomputes matrices and constants
- Pass the baked `params` as the last argument to `from`/`to`
- **Bake once, reuse many times** for best performance

---

## Additional utilities

### Color-vision deficiency simulation

```js
import { cvd } from "pixl.ink";

const srgbColor = { r: 1, g: 0.5, b: 0 };

// Simulate protanopia
const protan = {};
cvd.simulate(protan, srgbColor, "protanopia");
// protan = { r: ~0.8, g: ~0.6, b: ~0.1 }

// Available modes
console.log(cvd.modes);
// { none, protanopia, deuteranopia, tritanopia, ... }
```

Input/output are **gamma-encoded sRGB** in `[0,1]`.

### Perceptibility check

```js
import { isColorPerceivable } from "pixl.ink";

const result = isColorPerceivable({ x: 0.3, y: 0.3, z: 0.3 });
// { isVisible: true, reason: "Within human perception" }
```

Checks if chromaticity is inside the spectral locus and luminance is physically plausible.

### Foreground color selection

```js
import { getForegroundColor } from "pixl.ink";

const bg = { r: 0.2, g: 0.1, b: 0.8 }; // sRGB
const fg = getForegroundColor(bg); // "white" or "black"
```

Uses WCAG relative luminance for contrast.

### Whitepoint data

```js
import { whites } from "pixl.ink";

console.log(whites.descriptions.D65);
// "D65 - Standard daylight (CIE D-series) with a correlated color temperature ~ 6504 K..."
```

---

## Notes on the package contents

This npm package includes:

- All color space conversions (`spaces/`)
- Core utilities (`utils.js`, `pool.js`, `options.js`, `whites/`, `cvd.js`, `perception.js`, `contrast.js`)
- Comprehensive test suite (`index.test.js`)

**Not included**: The web UI code (sliders, 2D slices, cards, rendering) is separate and lives in a different repository. The `ui` metadata in each space is provided for consumers who want to build UIs on top, but no UI components ship with this package.

---

## Design principles

- **Functional & stateless**: No global config; all parameters passed explicitly
- **Performance-first**: Pooled allocations, optimized matrix math, minimal branching
- **Accuracy**: All conversions go through a single XYZ anchor; adaptation matrices calculated at runtime from primaries/whitepoints
- **Composability**: Chain conversions freely; each space is independent
- **No magic**: Normalization, clamping, and options behavior are explicit and documented

---

## License

See repository for license details.

---

## Contributing

When adding a space:

1. Implement `from`/`to` against XYZ (D65/2°)
2. Add `ui` metadata and `tags`/`base`
3. Provide `expected` values from an **independent reference** (not self-generated)
4. Run tests: `npm test`
5. Update this README if adding new categories

PRs welcome.
