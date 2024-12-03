const map = {
	// NativeBase prop: TailwindCSS class
	'flex': 'flex-$val',
	'p': 'p-[$valpx]',
	'pt': 'pt-[$valpx]',
	'pr': 'pr-[$valpx]',
	'pb': 'pb-[$valpx]',
	'pl': 'pl-[$valpx]',
	'm': 'm-[$valpx]',
	'mt': 'mt-[$valpx]',
	'mr': 'mr-[$valpx]',
	'mb': 'mb-[$valpx]',
	'ml': 'ml-[$valpx]',
	'h': 'h-$val',
	'w': 'w-$val',
	'minHeight': 'min-h-[$valpx]',
	'minWidth': 'min-w-[$valpx]',
	'maxHeight': 'max-h-[$valpx]',
	'maxWidth': 'max-w-[$valpx]',
	'top': 'top-[$valpx]',
	'right': 'right-[$valpx]',
	'bottom': 'bottom-[$valpx]',
	'left': 'left-[$valpx]',
	'bg': 'bg-$val',
	'color': 'text-$val',
	'justifyContent': 'justify-$val',
	'alignItems': 'items-$val',
	'alignSelf': 'self-$val',
	'overflow': 'overflow-$val',
	'borderWidth': 'border-[$valpx]',
	'borderColor': 'border-$val',
	'borderRadius': 'rounded-$val',
	'fontSize': 'text-[$valpx]',
	'fontWeight': 'font-$val',
	'lineHeight': 'leading-[$valpx]',
	'textAlign': 'text-$val',
	'zIndex': 'z-$val',
};

/**
 * Takes an incoming object with NativeBase properties 
 * and converts them to TailwindCSS classes
 * @param {object} obj 
 * @returns {string}
 */
export default function objectToClassName(obj) {

	let className = obj?.className || '',
		key,
		val,
		twClass;

	for (key in obj) {
		if (obj[key] !== null && obj[key] !== undefined && map[key]) {
			val = obj[key] + ''; // convert to string
			twClass = map[key];
			if (key === 'w' || key === 'h') {
				// special cases for height and width
				if (val.match(/^[0-9]+$/)) {
					val = '[' + val + 'px]';
				} else if (val === '100%') {
					val = 'full';
				} else if (val.match(/%/)) {
					val = '[' + val + ']';
				}
			}
			className += ' ' + twClass.replace('$val', val);
		}
	}

	return className;
}