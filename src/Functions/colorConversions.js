export function hslToRgb(h,s,l) {
	let a = s * Math.min(l, 1-l);
	let f = (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
	return [f(0),f(8),f(4)];
}

export function hslaToRgba(h, s, l, a) {
	return [...hslToRgb(h, s, l), a];
}

export function rgbToHsl(r, g, b) {
	(r /= 255), (g /= 255), (b /= 255);
	const vmax = max(r, g, b), vmin = min(r, g, b);
	let h, s, l = (vmax + vmin) / 2;

	if (vmax === vmin) {
		return [0, 0, l]; // achromatic
	}

	const d = vmax - vmin;
	s = l > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
	if (vmax === r) h = (g - b) / d + (g < b ? 6 : 0);
	if (vmax === g) h = (b - r) / d + 2;
	if (vmax === b) h = (r - g) / d + 4;
	h /= 6;

	return [h, s, l];
}

export function rgbToHex(rgb) {
	let r = rgb[0].toString(16),
		g = rgb[1].toString(16),
		b = rgb[2].toString(16);
	if (r.length === 1) {
		r = '0' + r;
	}
	if (g.length === 1) {
		g = '0' + g;
	}
	if (b.length === 1) {
		b = '0' + b;
	}
	hex = '#' + r + g + b;
	return hex;
}

export function rgbaToHex(rgba) {
	let r = rgba[0].toString(16),
		g = rgba[1].toString(16),
		b = rgba[2].toString(16),
		a = rgba[3].toString(16);
	if (r.length === 1) {
		r = '0' + r;
	}
	if (g.length === 1) {
		g = '0' + g;
	}
	if (b.length === 1) {
		b = '0' + b;
	}
	if (a.length === 1) {
		a = '0' + a;
	}
	hex = '#' + r + g + b + a;
	return hex;
}

export function hslToHex(hsl) {
	return rgbToHex(hslToRgb(hsl[0], hsl[1], hsl[2]));
}

export function hslaToHex(hsla) {
	return rgbaToHex(hslaToRgba(hsla[0], hsla[1], hsla[2], hsla[3]));
}
