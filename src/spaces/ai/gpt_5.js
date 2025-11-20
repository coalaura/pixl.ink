export default {
	name: "GPT-Vorticolor",
	long: "GPT Vorticolor Coupled-Flow Color Space",
	css: "gpt-vorticolor",
	experimental: true,
	tags: ["experimental_model"],
	ui: {
		vf: { from: 0, to: 1, step: 0.001, round: 3, name: "Vortex Flux" },
		sr: { from: 0, to: 1, step: 0.001, round: 3, name: "Shear Ratio" },
		ct: { from: 0, to: 1, step: 0.001, round: 3, name: "Curl Tilt" },
	},
	info: {
		model: "GPT-5",
		text: 'GPT-5 Vorticolor treats color as a coupled flow over XYZ rather than a point in a cylinder, with three deliberately non-orthogonal channels that behave like fluid descriptors: **vf** (Vortex Flux) captures the global drive through the field, **sr** (Shear Ratio) captures lateral differential driven primarily by the z-ward component, and **ct** (Curl Tilt) captures the rotational bias introduced by the other two. The organizing principle is a directed triangular coupling: vf depends on transformed y and z, sr depends only on transformed z, and ct depends on vf and sr, so edits propagate asymmetrically and coherently, producing structured shifts instead of isolated tweaks. Internally, XYZ is embedded into a symmetric real domain via *asinh* for stability and balanced response at the edges, bounded cross-influences are injected with saturating functions (*tanh*, *sin*, *sech*), and outputs are normalized with a *sigmoid*; the inverse uses *logit* and exact back-substitution (solve ct→c, sr→b, vf→a) for clean round-trips. This space is not a rotated RGB or a perceptual-uniform model; it\'s a controllable nonlinear dynamical mapping where small adjustments to one "flow" dimension cause purposeful, interpretable responses in the others. The goal is creative leverage, gradient design, animation, and palette morphing that feel "alive": nudge **vf** to push overall energy without crushing neutrals, modulate **sr** to shape edge interactions, and steer **ct** to add or remove swirl-like coupling, treating color as motion through a field rather than static coordinates.',
	},

	to: (xyz, out = {}) => {
		const sigmoid = t => 1 / (1 + Math.exp(-t)),
			sech = t => 1 / Math.cosh(t);

		const phi1 = (_b, _c) => 0.5 * Math.tanh(_b) + 0.25 * Math.sin(0.5 * Math.PI * _c) + 0.1 * _b * _c * sech(_b) * sech(_c),
			phi2 = _c => 0.75 * Math.sin(_c) * sech(_c),
			phi3 = (_d1, _d2) => 0.3 * Math.sin((2 * _d1 - _d2) / Math.sqrt(5)) * Math.exp(-(_d1 * _d1 + _d2 * _d2) / 16);

		const a = Math.asinh(xyz.x),
			b = Math.asinh(xyz.y),
			c = Math.asinh(xyz.z);

		const d1 = a + phi1(b, c),
			d2 = b + phi2(c),
			d3 = c + phi3(d1, d2);

		out.vf = sigmoid(d1);
		out.sr = sigmoid(d2);
		out.ct = sigmoid(d3);

		return out;
	},
	from: (model, out = {}) => {
		const logit = p => Math.log(p / (1 - p)),
			sech = t => 1 / Math.cosh(t);

		const phi1 = (_b, _c) => 0.5 * Math.tanh(_b) + 0.25 * Math.sin(0.5 * Math.PI * _c) + 0.1 * _b * _c * sech(_b) * sech(_c),
			phi2 = _c => 0.75 * Math.sin(_c) * sech(_c),
			phi3 = (_d1, _d2) => 0.3 * Math.sin((2 * _d1 - _d2) / Math.sqrt(5)) * Math.exp(-(_d1 * _d1 + _d2 * _d2) / 16);

		const d1 = logit(model.vf),
			d2 = logit(model.sr),
			d3 = logit(model.ct);

		const c = d3 - phi3(d1, d2),
			b = d2 - phi2(c),
			a = d1 - phi1(b, c);

		out.x = Math.sinh(a);
		out.y = Math.sinh(b);
		out.z = Math.sinh(c);

		return out;
	},
};
