export default {
	name: "DeepSeek-Resonance",
	long: "DeepSeek Resonance Color Space with Fundamental Frequency and Harmonic Strength",
	css: "deepseek-resonance",
	experimental: true,
	tags: ["experimental_model"],
	ui: {
		ff: { from: 0, to: 360, step: 1, round: 0, name: "Fundamental Frequency" },
		hs: { from: 0, to: 100, step: 1, round: 0, name: "Harmonic Strength" },
		rd: { from: 0, to: 100, step: 1, round: 0, name: "Resonance Depth" },
	},
	info: {
		model: "DeepSeek v3.2",
		text: "The DeepSeek-Resonance color space models color using a **fundamental frequency** derived from the angular relationship between the x and z tristimulus components, **harmonic strength** as the magnitude in the x-z plane representing color intensity, and **resonance depth** as the y-component akin to luminance. This approach aims to provide a novel way to manipulate colors by emphasizing frequency-based and strength relationships, which could be useful for applications requiring intuitive control over color harmony or resonant visual effects, rather than relying on traditional hue or saturation models.",
	},

	to: (xyz, out = {}) => {
		const x = xyz.x,
			y = xyz.y,
			z = xyz.z;

		const angle = Math.atan2(z, x);

		out.ff = (angle + Math.PI) / (2 * Math.PI);
		out.hs = Math.sqrt(x * x + z * z) / Math.sqrt(2);
		out.rd = y;

		return out;
	},
	from: (model, out = {}) => {
		const angle = 2 * Math.PI * model.ff - Math.PI;

		out.x = model.hs * Math.sqrt(2) * Math.cos(angle);
		out.y = model.rd;
		out.z = model.hs * Math.sqrt(2) * Math.sin(angle);

		return out;
	},
};
