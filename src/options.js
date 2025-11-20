/**
 * options: {
 *   num: { type: "number", min: 1, max: 23, default: 12, name: "Some number option" },
 *   bol: { type: "boolean", default: false, name: "Some boolean option" },
 *   enm: { type: "enum", allowed: ["val1", "val2", "val3"], default: "val2", name: "Some enum option" },
 * }
 */

function validateOption(option, value) {
	if (value === undefined || value === null) {
		return option.default;
	}

	switch (option.type) {
		case "number":
			if (typeof value !== "number") {
				return option.default;
			}

			if (typeof option.min === "number") {
				value = Math.max(option.min, value);
			}

			if (typeof option.max === "number") {
				value = Math.min(option.max, value);
			}

			break;

		case "enum":
			if (!option.allowed.includes(value)) {
				return option.default;
			}

			break;

		case "boolean":
			if (value !== false && value !== true) {
				return option.default;
			}

			break;
	}

	return value;
}

export function resolveOptions(available, provided = {}) {
	const cleaned = {};

	for (const name in available) {
		const option = available[name];

		cleaned[name] = validateOption(option, provided[name]);
	}

	return cleaned;
}
