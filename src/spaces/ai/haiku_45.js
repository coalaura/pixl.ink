export default {
	name: "Haiku-Fibonacci",
	long: "Haiku Fibonacci Harmonic Resonance",
	css: "haiku-fibonacci",
	experimental: true,
	tags: ["experimental_model"],
	ui: {
		r1: { from: 0, to: 100, step: 1, round: 0, name: "Primary Harmonic" },
		r2: { from: 0, to: 100, step: 1, round: 0, name: "Secondary Harmonic" },
		r3: { from: 0, to: 100, step: 1, round: 0, name: "Tertiary Harmonic" },
	},
	info: {
		model: "Haiku 4.5",
		text: 'The Haiku-Fibonacci color space is built on the premise that the golden ratio (phi) represents a naturally occurring harmonic principle that could be meaningfully applied to color perception. Rather than organizing color around perceptual uniformity or opponent color theory like traditional spaces, this model transforms XYZ tristimulus values through a symmetric matrix weighted by phi and its reciprocals (1/phi and 1/phi²), creating three interdependent harmonic channels that encode color as resonant relationships rather than independent dimensions. The three channels, Primary, Secondary, and Tertiary Harmonic, are non-orthogonal combinations of the stimulus values, each emphasizing different aspects of the color through phi-weighted coefficients. The conceptual goal is that by grounding color manipulation in phi-based ratios, similar to how these ratios govern natural proportions and musical harmony, the color space could provide intuitive relationships between hues while enabling harmonic color manipulations that feel more "natural" than those in orthogonal spaces. The channels interact such that adjusting one inherently influences the harmonic balance of the others, mimicking how changes in one aspect of harmony typically affect the whole, making it particularly suited for applications where color relationships and coherence matter more than perceptual uniformity.',
	},

	to: (xyz, out = {}) => {
		const x = xyz.x,
			y = xyz.y,
			z = xyz.z;

		const phi = (1 + Math.sqrt(5)) / 2,
			phiInv = 1 / phi,
			phiInv2 = 1 / (phi * phi);

		const r1 = x + phiInv * y + phiInv2 * z,
			r2 = phiInv * x + y + phiInv * z,
			r3 = phiInv2 * x + phiInv * y + z;

		const r1Max = 1 + phiInv + phiInv2,
			r2Max = 1 + 2 * phiInv,
			r3Max = 1 + phiInv + phiInv2;

		out.r1 = r1 / r1Max;
		out.r2 = r2 / r2Max;
		out.r3 = r3 / r3Max;

		return out;
	},
	from: (model, out = {}) => {
		const phi = (1 + Math.sqrt(5)) / 2,
			phiInv = 1 / phi,
			phiInv2 = 1 / (phi * phi);

		const r1Max = 1 + phiInv + phiInv2,
			r2Max = 1 + 2 * phiInv,
			r3Max = 1 + phiInv + phiInv2;

		const r1 = model.r1 * r1Max,
			r2 = model.r2 * r2Max,
			r3 = model.r3 * r3Max;

		const m = [
			[1, phiInv, phiInv2],
			[phiInv, 1, phiInv],
			[phiInv2, phiInv, 1],
		];

		const det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

		const inv00 = (m[1][1] * m[2][2] - m[1][2] * m[2][1]) / det,
			inv01 = -(m[0][1] * m[2][2] - m[0][2] * m[2][1]) / det,
			inv02 = (m[0][1] * m[1][2] - m[0][2] * m[1][1]) / det,
			inv10 = -(m[1][0] * m[2][2] - m[1][2] * m[2][0]) / det,
			inv11 = (m[0][0] * m[2][2] - m[0][2] * m[2][0]) / det,
			inv12 = -(m[0][0] * m[1][2] - m[0][2] * m[1][0]) / det,
			inv20 = (m[1][0] * m[2][1] - m[1][1] * m[2][0]) / det,
			inv21 = -(m[0][0] * m[2][1] - m[0][1] * m[2][0]) / det,
			inv22 = (m[0][0] * m[1][1] - m[0][1] * m[1][0]) / det;

		out.x = inv00 * r1 + inv01 * r2 + inv02 * r3;
		out.y = inv10 * r1 + inv11 * r2 + inv12 * r3;
		out.z = inv20 * r1 + inv21 * r2 + inv22 * r3;

		return out;
	},
};
