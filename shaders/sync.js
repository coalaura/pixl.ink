import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as utils from "../src/utils.js";
import { sharedShaderConstants as zcamConstants } from "../src/spaces/zcam.js";

const directory = path.dirname(fileURLToPath(import.meta.url));

export async function syncShaderConstants(check = false) {
	let updated = 0;
	const files = fs.readdirSync(path.join(directory, "spaces")).filter(file => file.endsWith(".glsl"));

	for (const file of ["utils.glsl", ...files]) {
		const shared = file === "utils.glsl";
		const source = shared ? utils : await import(`../src/spaces/${file.replace(".glsl", ".js")}`);
		const constants = shared ? { ...utils, ...utils.shaderConstants, ...zcamConstants } : source.shaderConstants;

		if (!constants) {
			continue;
		}

		const filename = path.join(directory, shared ? "" : "spaces", file);
		const original = fs.readFileSync(filename, "utf8");
		const matched = new Set();
		const content = original.replace(/const (float|vec3|mat3) (\w+)\s*=\s*[^;]+;/g, (declaration, type, name) => {
			if (!(name in constants)) {
				return declaration;
			}

			matched.add(name);
			return `const ${type} ${name} = ${formatConstant(type, constants[name])};`;
		});

		if (!shared) {
			for (const name of Object.keys(constants)) {
				if (!matched.has(name)) {
					throw new Error(`Missing GLSL declaration: ${file}: ${name}`);
				}
			}
		}

		if (content !== original) {
			if (check) {
				throw new Error(`Shader constants are out of date: ${file}`);
			}

			fs.writeFileSync(filename, content);
			updated++;
		}
	}

	return updated;
}

function formatFloat(value) {
	if (!Number.isFinite(value)) {
		throw new Error(`Invalid GLSL constant: ${value}`);
	}

	const text = String(value);
	return /[.e]/i.test(text) ? text : `${text}.0`;
}

function formatConstant(type, value) {
	if (type === "float") {
		return formatFloat(value);
	}

	if (type === "vec3" && value.length === 3) {
		return `vec3(${Array.from(value, formatFloat).join(", ")})`;
	}

	if (type === "mat3" && value.length === 9) {
		// JavaScript matrices are row-major; GLSL constructors take columns.
		const columns = [];

		for (let column = 0; column < 3; column++) {
			columns.push(`\tvec3(${formatFloat(value[column])}, ${formatFloat(value[column + 3])}, ${formatFloat(value[column + 6])})`);
		}

		return `mat3(\n${columns.join(",\n")}\n)`;
	}

	throw new Error(`Invalid ${type} constant`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	const updated = await syncShaderConstants(process.argv.includes("--check"));
	console.log(`Shader constants synchronized (${updated} files updated).`);
}
