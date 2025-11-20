const store3 = [],
	store2 = [],
	storeObj = [];

let top3 = 0,
	top2 = 0,
	topObj = 0;

let allocated3 = 0,
	allocated2 = 0,
	allocatedObj = 0;

export function alloc3() {
	allocated3++;

	if (top3 > 0) {
		return store3[--top3];
	}

	return new Float64Array(3);
}

export function alloc2() {
	allocated2++;

	if (top2 > 0) {
		return store2[--top2];
	}

	return new Float64Array(2);
}

export function allocObj() {
	allocatedObj++;

	if (topObj > 0) {
		return storeObj[--topObj];
	}

	return new Object();
}

export function free3(v) {
	allocated3--;

	store3[top3++] = v;
}

export function free2(v) {
	allocated2--;

	store2[top2++] = v;
}

export function freeObj(v) {
	allocatedObj--;

	storeObj[topObj++] = v;
}

export function check3() {
	return {
		cap: top3,
		alloc: allocated3,
	};
}

export function check2() {
	return {
		cap: top2,
		alloc: allocated2,
	};
}

export function checkObj() {
	return {
		cap: topObj,
		alloc: allocatedObj,
	};
}
