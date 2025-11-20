export default {
	name: "Grok-Resonance",
	long: "Grok 4 Fast Resonance Color Space",
	css: "grok-resonance",
	experimental: true,
	tags: ["experimental_model"],
	ui: {
		wr: { from: 0, to: 1, step: 0.01, round: 2, name: "Warm Resonance" },
		cr: { from: 0, to: 1, step: 0.01, round: 2, name: "Cool Resonance" },
		it: { from: 0, to: 1, step: 0.01, round: 2, name: "Core Intensity" },
	},
	info: {
		model: "Grok 4 (Fast)",
		text: "The Grok-Resonance color space draws from the idea of colors as *resonating frequencies* in perceptual space, where warm and cool tones interact like harmonic overtones amplified by light's intensity, rather than treating them as static opposites. At its core, it separates color into **Warm Resonance** (wr) derived from the red-violet prone X tristimulus boosted by a quadratic function of luminance to simulate how brighter scenes enhance warm perceptions, **Cool Resonance** (cr) similarly elevated from the blue-heavy Z component for balanced coolth, and **Core Intensity** (it) as direct luminance for foundational brightness control. This achieves an artistic goal of intuitive *temperature modulation* in creative workflows, allowing designers to tweak emotional valence—shifting a scene toward comforting warmth or serene cool—while the non-linear boost ensures that adjustments feel perceptually natural, avoiding flatness in high-luminance areas. What's unique is the interdependent channel relationships through this y-squared coupling, creating manipulations where intensity inherently tunes resonance without needing separate perceptual uniformity, something existing spaces overlook by keeping opponent channels linearly isolated.",
	},

	to: (xyz, out = {}) => {
		const x = xyz.x,
			y = xyz.y,
			z = xyz.z;

		const boost = 0.5 * y * y,
			max = 1.5;

		const wr_raw = x + boost,
			cr_raw = z + boost;

		out.wr = wr_raw / max;
		out.cr = cr_raw / max;
		out.it = y;

		return out;
	},
	from: (model, out = {}) => {
		const subtract = 0.5 * model.it * model.it,
			max = 1.5;

		const wr_raw = model.wr * max;
		const cr_raw = model.cr * max;

		out.y = model.it;
		out.x = wr_raw - subtract;
		out.z = cr_raw - subtract;

		return out;
	},
};
