import { alloc3, free3 } from "../pool.js";
import { clamp, EPS_PRECISION, srgbToXyz, xyzToSrgb } from "../utils.js";

const RYB_CUBE_W = [1.0, 1.0, 1.0],
	RYB_CUBE_R = [1.0, 0.0, 0.0],
	RYB_CUBE_Y = [1.0, 1.0, 0.0],
	RYB_CUBE_O = [1.0, 0.5, 0.0],
	RYB_CUBE_B = [0.163, 0.373, 0.6],
	RYB_CUBE_V = [0.5, 0.0, 0.5],
	RYB_CUBE_G = [0.0, 0.66, 0.2],
	RYB_CUBE_K = [0.2, 0.094, 0.0];

function forwardRYB(out, r, y, b) {
	let c00 = RYB_CUBE_W[0] + (RYB_CUBE_R[0] - RYB_CUBE_W[0]) * r,
		c10 = RYB_CUBE_Y[0] + (RYB_CUBE_O[0] - RYB_CUBE_Y[0]) * r,
		c01 = RYB_CUBE_B[0] + (RYB_CUBE_V[0] - RYB_CUBE_B[0]) * r,
		c11 = RYB_CUBE_G[0] + (RYB_CUBE_K[0] - RYB_CUBE_G[0]) * r;

	let c0 = c00 + (c10 - c00) * y,
		c1 = c01 + (c11 - c01) * y;

	out[0] = c0 + (c1 - c0) * b;

	c00 = RYB_CUBE_W[1] + (RYB_CUBE_R[1] - RYB_CUBE_W[1]) * r;
	c10 = RYB_CUBE_Y[1] + (RYB_CUBE_O[1] - RYB_CUBE_Y[1]) * r;
	c01 = RYB_CUBE_B[1] + (RYB_CUBE_V[1] - RYB_CUBE_B[1]) * r;
	c11 = RYB_CUBE_G[1] + (RYB_CUBE_K[1] - RYB_CUBE_G[1]) * r;

	c0 = c00 + (c10 - c00) * y;
	c1 = c01 + (c11 - c01) * y;

	out[1] = c0 + (c1 - c0) * b;

	c00 = RYB_CUBE_W[2] + (RYB_CUBE_R[2] - RYB_CUBE_W[2]) * r;
	c10 = RYB_CUBE_Y[2] + (RYB_CUBE_O[2] - RYB_CUBE_Y[2]) * r;
	c01 = RYB_CUBE_B[2] + (RYB_CUBE_V[2] - RYB_CUBE_B[2]) * r;
	c11 = RYB_CUBE_G[2] + (RYB_CUBE_K[2] - RYB_CUBE_G[2]) * r;
	c0 = c00 + (c10 - c00) * y;
	c1 = c01 + (c11 - c01) * y;

	out[2] = c0 + (c1 - c0) * b;

	return out;
}

function jacobianRYB(out1, out2, out3, r, y, b) {
	const ry = y,
		r1y = 1 - y;

	const rb = b,
		r1b = 1 - b;

	const rr = r,
		r1r = 1 - r;

	out1[0] =
		(RYB_CUBE_R[0] - RYB_CUBE_W[0]) * r1y * r1b +
		(RYB_CUBE_O[0] - RYB_CUBE_Y[0]) * ry * r1b +
		(RYB_CUBE_V[0] - RYB_CUBE_B[0]) * r1y * rb +
		(RYB_CUBE_K[0] - RYB_CUBE_G[0]) * ry * rb;
	out1[1] =
		(RYB_CUBE_R[1] - RYB_CUBE_W[1]) * r1y * r1b +
		(RYB_CUBE_O[1] - RYB_CUBE_Y[1]) * ry * r1b +
		(RYB_CUBE_V[1] - RYB_CUBE_B[1]) * r1y * rb +
		(RYB_CUBE_K[1] - RYB_CUBE_G[1]) * ry * rb;
	out1[2] =
		(RYB_CUBE_R[2] - RYB_CUBE_W[2]) * r1y * r1b +
		(RYB_CUBE_O[2] - RYB_CUBE_Y[2]) * ry * r1b +
		(RYB_CUBE_V[2] - RYB_CUBE_B[2]) * r1y * rb +
		(RYB_CUBE_K[2] - RYB_CUBE_G[2]) * ry * rb;

	out2[0] =
		(RYB_CUBE_Y[0] - RYB_CUBE_W[0]) * r1r * r1b +
		(RYB_CUBE_O[0] - RYB_CUBE_R[0]) * rr * r1b +
		(RYB_CUBE_G[0] - RYB_CUBE_B[0]) * r1r * rb +
		(RYB_CUBE_K[0] - RYB_CUBE_V[0]) * rr * rb;
	out2[1] =
		(RYB_CUBE_Y[1] - RYB_CUBE_W[1]) * r1r * r1b +
		(RYB_CUBE_O[1] - RYB_CUBE_R[1]) * rr * r1b +
		(RYB_CUBE_G[1] - RYB_CUBE_B[1]) * r1r * rb +
		(RYB_CUBE_K[1] - RYB_CUBE_V[1]) * rr * rb;
	out2[2] =
		(RYB_CUBE_Y[2] - RYB_CUBE_W[2]) * r1r * r1b +
		(RYB_CUBE_O[2] - RYB_CUBE_R[2]) * rr * r1b +
		(RYB_CUBE_G[2] - RYB_CUBE_B[2]) * r1r * rb +
		(RYB_CUBE_K[2] - RYB_CUBE_V[2]) * rr * rb;

	out3[0] =
		(RYB_CUBE_B[0] - RYB_CUBE_W[0]) * r1r * r1y +
		(RYB_CUBE_V[0] - RYB_CUBE_R[0]) * rr * r1y +
		(RYB_CUBE_G[0] - RYB_CUBE_Y[0]) * r1r * ry +
		(RYB_CUBE_K[0] - RYB_CUBE_O[0]) * rr * ry;
	out3[1] =
		(RYB_CUBE_B[1] - RYB_CUBE_W[1]) * r1r * r1y +
		(RYB_CUBE_V[1] - RYB_CUBE_R[1]) * rr * r1y +
		(RYB_CUBE_G[1] - RYB_CUBE_Y[1]) * r1r * ry +
		(RYB_CUBE_K[1] - RYB_CUBE_O[1]) * rr * ry;
	out3[2] =
		(RYB_CUBE_B[2] - RYB_CUBE_W[2]) * r1r * r1y +
		(RYB_CUBE_V[2] - RYB_CUBE_R[2]) * rr * r1y +
		(RYB_CUBE_G[2] - RYB_CUBE_Y[2]) * r1r * ry +
		(RYB_CUBE_K[2] - RYB_CUBE_O[2]) * rr * ry;
}

function solve3(out, a, b, c, d, e, f, g, h, i, b0, b1, b2) {
	const A = e * i - f * h,
		Bc = -(d * i - f * g),
		Cc = d * h - e * g,
		D = -(b * i - c * h),
		E = a * i - c * g,
		F = -(a * h - b * g),
		G = b * f - c * e,
		H = -(a * f - c * d),
		I = a * e - b * d;

	const det = a * A + b * Bc + c * Cc;

	if (Math.abs(det) < EPS_PRECISION) {
		out[0] = 0;
		out[1] = 0;
		out[2] = 0;

		return out;
	}

	const invDet = 1 / det;

	out[0] = (A * b0 + D * b1 + G * b2) * invDet;
	out[1] = (Bc * b0 + E * b1 + H * b2) * invDet;
	out[2] = (Cc * b0 + F * b1 + I * b2) * invDet;

	return out;
}

function rgbToRyb(rgbTarget, coarseSteps = 6, maxIter = 48) {
	const t0 = rgbTarget[0],
		t1 = rgbTarget[1],
		t2 = rgbTarget[2];

	rgbTarget[0] = 0.5;
	rgbTarget[1] = 0.5;
	rgbTarget[2] = 0.5;

	let bestE2 = Infinity;

	const steps = Math.max(2, coarseSteps);

	for (let i = 0; i < steps; i++) {
		const r = i / (steps - 1);

		for (let j = 0; j < steps; j++) {
			const y = j / (steps - 1);

			for (let k = 0; k < steps; k++) {
				const b = k / (steps - 1);

				const v3 = forwardRYB(alloc3(), r, y, b);

				const dx = v3[0] - t0,
					dy = v3[1] - t1,
					dz = v3[2] - t2;

				free3(v3);

				const ee = dx * dx + dy * dy + dz * dz;

				if (ee < bestE2) {
					bestE2 = ee;
					rgbTarget[0] = r;
					rgbTarget[1] = y;
					rgbTarget[2] = b;
				}
			}
		}
	}

	for (let it = 0; it < maxIter; it++) {
		const v3 = forwardRYB(alloc3(), rgbTarget[0], rgbTarget[1], rgbTarget[2]);

		const rhs0 = t0 - v3[0],
			rhs1 = t1 - v3[1],
			rhs2 = t2 - v3[2];

		free3(v3);

		const e2_old = rhs0 * rhs0 + rhs1 * rhs1 + rhs2 * rhs2;

		const j1 = alloc3(),
			j2 = alloc3(),
			j3 = alloc3();

		jacobianRYB(j1, j2, j3, rgbTarget[0], rgbTarget[1], rgbTarget[2]);

		const sol = solve3(alloc3(), j1[0], j1[1], j1[2], j2[0], j2[1], j2[2], j3[0], j3[1], j3[2], rhs0, rhs1, rhs2);

		free3(j1);
		free3(j2);
		free3(j3);

		let d0, d1, d2;

		if (sol[0] !== 0 || sol[1] !== 0 || sol[2] !== 0) {
			d0 = sol[0];
			d1 = sol[1];
			d2 = sol[2];
		} else {
			const scale = 0.05;

			d0 = scale * rhs0;
			d1 = scale * rhs1;
			d2 = scale * rhs2;
		}

		free3(sol);

		let improved = false,
			alpha = 1.0;

		for (let ls = 0; ls < 10; ls++) {
			const c0 = clamp(rgbTarget[0] + alpha * d0, 0, 1),
				c1 = clamp(rgbTarget[1] + alpha * d1, 0, 1),
				c2 = clamp(rgbTarget[2] + alpha * d2, 0, 1);

			const nf3 = forwardRYB(alloc3(), c0, c1, c2);

			const ndx = nf3[0] - t0,
				ndy = nf3[1] - t1,
				ndz = nf3[2] - t2;

			free3(nf3);

			const e2_new = ndx * ndx + ndy * ndy + ndz * ndz;

			if (e2_new + EPS_PRECISION < e2_old) {
				rgbTarget[0] = c0;
				rgbTarget[1] = c1;
				rgbTarget[2] = c2;

				improved = true;

				break;
			}

			alpha *= 0.5;
		}

		if (!improved) {
			break;
		}

		if (e2_old < EPS_PRECISION) {
			break;
		}
	}

	return rgbTarget;
}

export default {
	name: "RYB",
	long: "RYB - Red-Yellow-Blue (Gossett & Chen trilinear; inverse via damped Newton)",
	css: "ryb",
	lossy: true,
	tags: ["ui_model", "experimental_model"],
	base: "sRGB",
	ui: {
		r: { from: 0, to: 1, step: 0.001, round: 3, name: "Red" },
		y: { from: 0, to: 1, step: 0.001, round: 3, name: "Yellow" },
		b: { from: 0, to: 1, step: 0.001, round: 3, name: "Blue" },
	},

	from: (ryb, out = {}) => {
		const v3 = forwardRYB(alloc3(), ryb.r, ryb.y, ryb.b);

		srgbToXyz(v3, v3[0], v3[1], v3[2]);

		out.x = v3[0];
		out.y = v3[1];
		out.z = v3[2];

		free3(v3);

		return out;
	},

	to: (xyz, out = {}, unclamped = false) => {
		const v3 = xyzToSrgb(alloc3(), xyz.x, xyz.y, xyz.z);

		rgbToRyb(v3);

		out.r = clamp(v3[0], 0, 1, unclamped);
		out.y = clamp(v3[1], 0, 1, unclamped);
		out.b = clamp(v3[2], 0, 1, unclamped);

		free3(v3);

		return out;
	},
};
