export default {
	name: "Kimi-Resonance",
	long: "Resonant Coupling Chromatic Space Based on Quantum Harmonic Phase States",
	css: "kimi-resonance",
	experimental: true,
	tags: ["experimental_model"],
	ui: {
		qf: { from: 0, to: 360, step: 1, round: 0, name: "Quantum Flux" },
		cp: { from: 0, to: 1, step: 0.001, round: 3, name: "Coherence Potential" },
		es: { from: -0.5, to: 0.5, step: 0.001, round: 3, name: "Entanglement Shift" },
	},
	info: {
		model: "Kimi K2",
		text: "Kimi-Resonance divides color into **Quantum Flux** as *active vs passive* component ratio, **Coherence Potential** as *total energy density*, and **Entanglement Shift** as *luminous fraction* that jointly control the microscopic makeup of light: you steer **Flux** to reshuffle how much 'charge' pulls toward red/green versus blue, **Potential** to pump in or bleed out overall vitality, and **Shift** to push the perceptual centre of gravity up or down in the spectrum, yielding an encoding where tweaking any knob reshapes the other two like coupled harmonic oscillators instead of simple orthogonal sliders.",
	},

	to: (xyz, out = {}) => {
		const x = xyz.x,
			y = xyz.y,
			z = xyz.z;

		const s = x + y + z;

		let cp = 0,
			es = 0,
			qf = 0;

		if (s > 0) {
			cp = s / (s + 1);
			es = y / s;

			const t = x + z;

			qf = t > 0 ? x / t : 0;
		}

		out.qf = qf;
		out.cp = cp;
		out.es = es;

		return out;
	},
	from: (model, out = {}) => {
		const cpSafe = model.cp <= 0 ? 0 : model.cp >= 1 ? 1 - 1e-12 : model.cp,
			s = cpSafe / (1 - cpSafe),
			y = s * model.es,
			t = s - y,
			x = model.qf * t,
			z = t - x;

		out.x = x;
		out.y = y;
		out.z = z;

		return out;
	},
};
