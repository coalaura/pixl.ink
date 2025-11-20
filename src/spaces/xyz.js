import { round } from "../utils.js";

export default {
	name: "CIE 1931 XYZ",
	long: "CIE 1931 XYZ Tristimulus (Device-Independent)",
	css: "xyz",
	tags: ["fundamental"],
	ui: {
		x: { from: 0, to: 1, step: 0.001, round: 3, name: "X" },
		y: { from: 0, to: 1, step: 0.001, round: 3, name: "Y", primary: true },
		z: { from: 0, to: 1, step: 0.001, round: 3, name: "Z" },
	},

	from: (xyz, out = {}) => {
		out.x = xyz.x;
		out.y = xyz.y;
		out.z = xyz.z;

		return out;
	},
	to: (xyz, out = {}) => {
		out.x = xyz.x;
		out.y = xyz.y;
		out.z = xyz.z;

		return out;
	},

	format: xyz => {
		const X = round(xyz.x, 4),
			Y = round(xyz.y, 4),
			Z = round(xyz.z, 4);

		return `color(xyz ${X} ${Y} ${Z})`;
	},

	expected: {
		"#000000": { x: 0, y: 0, z: 0 },
		"#FFFFFF": { x: 0.9505, y: 1.0, z: 1.0888 },
		"#FF0000": { x: 0.4125, y: 0.2127, z: 0.0193 },
		"#00FF00": { x: 0.3576, y: 0.7152, z: 0.1192 },
		"#0000FF": { x: 0.1804, y: 0.0722, z: 0.9503 },
		"#FFFF00": { x: 0.77, y: 0.9278, z: 0.1385 },
		"#00FFFF": { x: 0.538, y: 0.7873, z: 1.0695 },
		"#FF00FF": { x: 0.5929, y: 0.2848, z: 0.9696 },
		"#808080": { x: 0.2052, y: 0.2159, z: 0.235 },
		"#FFA500": { x: 0.547, y: 0.4818, z: 0.0642 },
	},
};
