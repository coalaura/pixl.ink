export default {
	name: "Gemini-Temporal",
	long: "Gemini Temporal Interference Space",
	css: "gemini-temporal",
	experimental: true,
	tags: ["experimental_model"],
	ui: {
		en: { from: 0, to: 3, step: 0.01, round: 2, name: "Energy" },
		os: { from: -1, to: 1, step: 0.01, round: 2, name: "Oscillation" },
		dc: { from: -1, to: 1, step: 0.01, round: 2, name: "Decay" },
	},
	info: {
		model: "Gemini 2.5 Pro",
		text: "The core idea behind the Gemini-Temporal space is to re-imagine color not as a static point in a geometric volume, but as a dynamic, *wave-like phenomenon*. Its three channels represent properties of this conceptual wave: **Energy (en)** is the total power or intensity of the signal, analogous to overall brightness; **Oscillation (os)** captures the primary red-green opponent signal as a non-linear harmonic wave, allowing for smooth, periodic shifts between these foundational colors; and **Decay (dc)** models the secondary yellow-blue opponent signal as an interfering wave that modulates the primary oscillation. The ultimate goal of this space is not perceptual uniformity, but to provide a unique tool for *generative art and dynamic color manipulation*. By separating color into these wave-like properties, a user can create complex, evolving palettes by animating the channels independently, achieving effects like harmonic resonance or controlled dissonance that are not intuitive to produce in traditional color spaces.",
	},

	to: (xyz, out = {}) => {
		const x = xyz.x,
			y = xyz.y,
			z = xyz.z;

		const unclamped_en = x + y + z,
			unclamped_os = Math.sin((Math.PI / 2) * (x - y)),
			unclamped_dc = Math.sin((Math.PI / 2) * (y - z));

		out.en = unclamped_en / 3;
		out.os = (unclamped_os + 1) / 2;
		out.dc = (unclamped_dc + 1) / 2;

		return out;
	},
	from: (model, out = {}) => {
		const C3 = model.en * 3,
			norm_os = model.os * 2 - 1,
			norm_dc = model.dc * 2 - 1;

		const C1 = (Math.asin(norm_os) * 2) / Math.PI,
			C2 = (Math.asin(norm_dc) * 2) / Math.PI;

		out.y = (C3 - C1 + C2) / 3;
		out.x = out.y + C1;
		out.z = out.y - C2;

		return out;
	},
};
