import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { spaces, symbols } from "./index.js";
import { check2, check3, checkObj } from "./pool.js";

const TestOnly = "";

expect.extend({
	toHaveAtLeastProperties: (received, count) => ({
		pass: Object.keys(received).length >= count,
		message: () => `Expected object to have at least ${count} properties, but has ${Object.keys(received).length}`,
	}),
	toHaveProperties: (received, count) => ({
		pass: Object.keys(received).length === count,
		message: () => `Expected object to have ${count} properties, but has ${Object.keys(received).length}`,
	}),
	toHaveAtLeastLength: (received, count) => ({
		pass: received.length >= count,
		message: () => `Expected length to be at least ${count}, but was ${received.length}`,
	}),
	toBeAnArray: received => ({
		pass: typeof received === "object" && Array.isArray(received),
		message: () => `Expected value to be an array, but was ${typeof received}`,
	}),
});

function rgb(...color) {
	return {
		r: color[0] / 255.0,
		g: color[1] / 255.0,
		b: color[2] / 255.0,
	};
}

function hex2xyz(hex) {
	if (hex.startsWith("#")) {
		hex = hex.slice(1);
	}

	const r = parseInt(hex.slice(0, 2), 16) / 255,
		g = parseInt(hex.slice(2, 4), 16) / 255,
		b = parseInt(hex.slice(4, 6), 16) / 255;

	return spaces.srgb.from({
		r: r,
		g: g,
		b: b,
	});
}

function json(path) {
	if (!existsSync(path)) {
		return null;
	}

	try {
		const content = readFileSync(path);

		return JSON.parse(content.toString());
	} catch {}

	return false;
}

const tests = [
	[spaces.srgb.from(rgb(0, 0, 0)), "Black"],
	[spaces.srgb.from(rgb(255, 255, 255)), "White"],
	[spaces.srgb.from(rgb(255, 0, 0)), "Red"],
	[spaces.srgb.from(rgb(0, 255, 0)), "Green"],
	[spaces.srgb.from(rgb(0, 0, 255)), "Blue"],
	[spaces.srgb.from(rgb(255, 255, 0)), "Yellow"],
	[spaces.srgb.from(rgb(0, 255, 255)), "Cyan"],
	[spaces.srgb.from(rgb(255, 0, 255)), "Magenta"],
	[spaces.srgb.from(rgb(128, 128, 128)), "Mid Gray"],
	[spaces.srgb.from(rgb(64, 64, 64)), "Dark Gray"],
	[spaces.srgb.from(rgb(192, 192, 192)), "Light Gray"],
	[spaces.srgb.from(rgb(10, 10, 10)), "Near Black"],
	[spaces.srgb.from(rgb(245, 245, 245)), "Near White (Off-white)"],
	[spaces.srgb.from(rgb(255, 165, 0)), "Orange"],
	[spaces.srgb.from(rgb(128, 0, 128)), "Purple"],
	[spaces.srgb.from(rgb(139, 69, 19)), "Brown (SaddleBrown)"],
	[spaces.srgb.from(rgb(0, 128, 128)), "Teal"],
	[spaces.srgb.from(rgb(240, 248, 255)), "AliceBlue (Very light blue)"],
	[spaces.srgb.from(rgb(255, 192, 203)), "Pink (Desaturated Red)"],
	[spaces.srgb.from(rgb(144, 238, 144)), "LightGreen (Desaturated Green)"],
	[spaces.srgb.from(rgb(173, 216, 230)), "LightBlue (Desaturated Blue)"],
	[spaces.srgb.from(rgb(50, 150, 200)), "A bluish color"],
	[spaces.srgb.from(rgb(200, 100, 50)), "An orangey-brown color"],
	[spaces.srgb.from(rgb(100, 200, 100)), "A lighter green"],
];

const example = spaces.srgb.from(rgb(128, 128, 128));

describe("General integrity", () => {
	for (const [name, space] of Object.entries(spaces)) {
		if (TestOnly && name !== TestOnly) {
			continue;
		}

		describe(space.name, () => {
			it("Name", () => {
				expect(space.name, "name").toBeTypeOf("string");
				expect(space.long, "long").toBeTypeOf("string");
				expect(space.css, "css").toBeTypeOf("string");

				expect(space.name, "name").toHaveAtLeastLength(3);
				expect(space.long, "long").toHaveAtLeastLength(3);
				expect(space.css, "css").toHaveAtLeastLength(3);
			});

			it("Tags & Base", () => {
				expect(space.tags, "tags").toBeAnArray();
				expect(space.tags, "tags").toHaveAtLeastLength(1);

				if (space.base) {
					expect(space.base, "base").toBeTypeOf("string");
					expect(space.base, "base").toHaveAtLeastLength(3);
				}
			});

			it("UI Properties", () => {
				expect(space.ui, "ui").toBeTypeOf("object");
				expect(space.ui, "ui").toHaveAtLeastProperties(2);
			});

			if (space.options) {
				it("Options", () => {
					expect(space.options, "options").toBeTypeOf("object");
					expect(space.options, "options").toHaveAtLeastProperties(1);

					expect(space.bake, "bake").toBeTypeOf("function");

					const baked = space.bake();

					expect(baked, "baked").toBeTypeOf("object");
					expect(baked, "baked").toHaveAtLeastProperties(1);
				});

				for (const opt in space.options) {
					it(`options.${opt}`, () => {
						const option = space.options[opt];

						expect(option, "option").toBeTypeOf("object");
						expect(option, "option").toHaveProperty("name");
						expect(option, "option").toHaveProperty("default");
						expect(option, "option").toHaveProperty("type");

						switch (option.type) {
							case "number":
								expect(option, "option").toHaveProperty("min");
								expect(option, "option").toHaveProperty("max");
								expect(option.default, "default").toBeTypeOf("number");

								break;

							case "boolean":
								expect(option.default, "default").toBeTypeOf("boolean");

								break;

							case "enum":
								expect(option, "option").toHaveProperty("allowed");
								expect(option.allowed, "allowed").toBeAnArray();
								expect(option.allowed, "allowed").toHaveAtLeastLength(2);

								break;
						}
					});
				}
			}

			if (space.experimental) {
				it("Info", () => {
					expect(space.info, "info").toBeTypeOf("object");

					expect(space.info, "info").toHaveProperty("model");
					expect(space.info.model, "model").toBeTypeOf("string");

					expect(space.info, "info").toHaveProperty("text");
					expect(space.info.text, "text").toBeTypeOf("string");
				});
			}

			if (!space.lossy && !space.experimental) {
				it("Expected", () => {
					expect(space.expected, "expected").toBeTypeOf("object");
					expect(space.expected, "expected").toHaveProperties(10);
				});
			}

			it("Conversions", () => {
				expect(space.from, "from").toBeTypeOf("function");
				expect(space.to, "to").toBeTypeOf("function");
			});

			if (space.format) {
				it("Format", () => {
					expect(space.format, "format").toBeTypeOf("function");

					const color = space.to(example),
						formatted = space.format(color);

					expect(formatted, "formatted").toBeTypeOf("string");
					expect(formatted, "formatted").toHaveAtLeastLength(3);
				});
			}

			for (const prop in space.ui) {
				it(`ui.${prop}`, () => {
					const property = space.ui[prop],
						symbol = symbols[prop];

					expect(property, "property").toBeTypeOf("object");
					expect(property, "property").toHaveProperty("from");
					expect(property, "property").toHaveProperty("to");
					expect(property, "property").toHaveProperty("name");

					expect(symbol, "symbol").toBeTypeOf("string");
					expect(symbol, "symbol").toHaveAtLeastLength(1);
				});
			}
		});
	}
});

describe("Data integrity", () => {
	for (const [name, space] of Object.entries(spaces)) {
		if (TestOnly && name !== TestOnly) {
			continue;
		}

		if (space.experimental) {
			continue;
		}

		it(space.name, () => {
			const path = `../web/src/data/${name.toLowerCase()}.json`,
				data = json(path);

			expect(data, "data").toBeTypeOf("object");

			expect(data, "data").toHaveProperty("overview");
			expect(data, "data").toHaveProperty("history");
			expect(data, "data").toHaveProperty("applications");
			expect(data, "data").toHaveProperty("technical");
			expect(data, "data").toHaveProperty("examples_and_resources");

			expect(data.overview, "overview").toBeTypeOf("string");
			expect(data.history, "history").toBeTypeOf("string");
			expect(data.applications, "applications").toBeTypeOf("string");
			expect(data.technical, "technical").toBeTypeOf("string");
			expect(data.examples_and_resources, "examples_and_resources").toBeTypeOf("string");

			expect(data.overview, "overview").toHaveAtLeastLength(10);
			expect(data.history, "history").toHaveAtLeastLength(10);
			expect(data.applications, "applications").toHaveAtLeastLength(10);
			expect(data.technical, "technical").toHaveAtLeastLength(10);
			expect(data.examples_and_resources, "examples_and_resources").toHaveAtLeastLength(10);
		});
	}
});

describe("Allocation integrity", () => {
	for (const [name, space] of Object.entries(spaces)) {
		if (TestOnly && name !== TestOnly) {
			continue;
		}

		it(space.name, () => {
			// initial allocations
			space.from(space.to(example));

			const before3 = check3(),
				before2 = check2(),
				beforeObj = checkObj();

			// calls should not increase/decrease the pooled arrays
			// like double free3 or alloc3 but no free3
			for (let i = 0; i < 5; i++) {
				space.from(space.to(example));
			}

			expect(before3, "check3").toEqual(check3());
			expect(before2, "check2").toEqual(check2());
			expect(beforeObj, "checkObj").toEqual(checkObj());
		});
	}
});

describe("Round-trip integrity", () => {
	for (const [name, space] of Object.entries(spaces)) {
		if (TestOnly && name !== TestOnly) {
			continue;
		}

		const to = {},
			from = {};

		describe(space.name, () => {
			for (const [input, label] of tests) {
				it(`round-trip "${label}"`, () => {
					space.to(input, to, true);
					space.from(to, from);

					expect(to, "to").toBeTypeOf("object");
					expect(from, "from").toBeTypeOf("object");

					expect(from.x, "from.x").toBeTypeOf("number");
					expect(from.y, "from.y").toBeTypeOf("number");
					expect(from.z, "from.z").toBeTypeOf("number");

					expect(from.x, "from.x").not.toBeNaN();
					expect(from.y, "from.y").not.toBeNaN();
					expect(from.z, "from.z").not.toBeNaN();

					if (space.lossy) {
						return;
					}

					expect(from.x, "from.x").toBeCloseTo(input.x, 2);
					expect(from.y, "from.y").toBeCloseTo(input.y, 2);
					expect(from.z, "from.z").toBeCloseTo(input.z, 2);
				});
			}
		});
	}
});

describe("Calculation correctness", () => {
	for (const [name, space] of Object.entries(spaces)) {
		if (TestOnly && name !== TestOnly) {
			continue;
		}

		if (!space.expected || space.experimental) {
			continue;
		}

		describe(space.name, () => {
			for (const [hex, value] of Object.entries(space.expected)) {
				describe(`"${hex}"`, () => {
					const xyz = hex2xyz(hex),
						from = space.to(xyz, {}, true);

					for (const property in from) {
						const expected = value[property],
							actual = from[property];

						it(property, () => {
							expect(expected, "expected").toBeTypeOf("number");
							expect(actual, "actual").toBeTypeOf("number");

							expect(expected, "expected").not.toBeNaN();
							expect(actual, "actual").not.toBeNaN();

							if (!space.lossy) {
								expect(actual, "actual").toBeCloseTo(expected, 2);
							}
						});
					}
				});
			}
		});
	}
});
