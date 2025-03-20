import Inflector from 'inflector-js';

/**
 * extractTailwindClasses
 * Extracts the tailwind classes from a className string.
 * 
 * @param {string} className
 * @returns {array} of classes
 */
export function extractTailwindClasses(className) {
	if (!className) {
		return [];
	}
	const regex = /[^\s]+/g;
	return className.match(regex) || [];
}

// Tailwind patterns to match classes to their CSS properties
export const commonCssPropertyPatterns = [
	{ pattern: /^h-/, property: 'height' },
	{ pattern: /^w-/, property: 'width' },
	{ pattern: /^flex(-.*)?$/, property: 'flex' },
	{ pattern: /^bg-/, property: 'background-color' },
	{ pattern: /^m([trblxy]?)\-/, property: (m) => `margin${m && m[1] ? '-' + m[1] : ''}` },
	{ pattern: /^p([trblxy]?)\-/, property: (m) => `padding${m && m[1] ? '-' + m[1] : ''}` },
	{ pattern: /^border-/, property: 'border' },
	{ pattern: /^text-\[.*\]$/, property: 'font-size' }, // Matches arbitrary font sizes like 'text-[12px]'
	{ pattern: /^text-(left|center|right|justify)$/, property: 'text-align' }, // Matches text alignment
	{ pattern: /^text-opacity-/, property: 'text-opacity' }, // Matches text opacity
	{ pattern: /^text-shadow(-.*)?$/, property: 'text-shadow' }, // Matches text shadow
	{ pattern: /^indent-/, property: 'text-indent' }, // Matches text indent
	{ pattern: /^text-(decoration|underline-offset)-/, property: 'text' }, // Matches text-related properties
	{ pattern: /^text-(black|white|grey|gray|red|yellow|green|blue|indigo|purple|pink|.*)$/, property: 'color' }, // Matches text colors
	{ pattern: /^(underline|overline|line-through|no-underline)$/, property: 'text-decoration' }, // Matches text decoration
	{ pattern: /^(uppercase|lowercase|capitalize|normal-case)$/, property: 'text-transform' }, // Matches text transform
	{ pattern: /^(truncate|overflow-ellipsis|overflow-clip)$/, property: 'text-overflow' }, // Matches text overflow
	{ pattern: /^decoration-/, property: 'text-decoration-color' }, // Matches text decoration color
	{ pattern: /^decoration-(solid|double|dotted|dashed|wavy)$/, property: 'text-decoration-style' }, // Matches text decoration style
	{ pattern: /^decoration-\[.*\]$/, property: 'text-decoration-thickness' }, // Matches arbitrary text decoration thickness
	{ pattern: /^underline-offset-\[.*\]$/, property: 'underline-offset' }, // Matches arbitrary underline offset
	{ pattern: /^font-/, property: 'font' },
	{ pattern: /^(block|inline-block|inline|flex|grid|hidden)$/, property: 'display' },
	{ pattern: /^items-/, property: 'items' },
	{ pattern: /^justify-/, property: 'justify' },
	{ pattern: /^background-/, property: 'background' },
	{ pattern: /^(visible|invisible)$/, property: 'visibility' },
	{ pattern: /^opacity-/, property: 'opacity' },
	{ pattern: /^z-/, property: 'z' },
];
export const allCssPropertyPatterns = [
	{ pattern: /^h-/, property: 'height' },
	{ pattern: /^w-/, property: 'width' },
	{ pattern: /^flex(-.*)?$/, property: 'flex' },
	{ pattern: /^bg-/, property: 'background-color' },
	{ pattern: /^m([trblxy]?)\-/, property: (m) => `margin${m && m[1] ? '-' + m[1] : ''}` },
	{ pattern: /^p([trblxy]?)\-/, property: (m) => `padding${m && m[1] ? '-' + m[1] : ''}` },
	{ pattern: /^border-/, property: 'border' },
	{ pattern: /^text-\[.*\]$/, property: 'font-size' }, // Matches arbitrary font sizes like 'text-[12px]'
	{ pattern: /^text-(left|center|right|justify)$/, property: 'text-align' }, // Matches text alignment
	{ pattern: /^text-opacity-/, property: 'text-opacity' }, // Matches text opacity
	{ pattern: /^text-shadow(-.*)?$/, property: 'text-shadow' }, // Matches text shadow
	{ pattern: /^indent-/, property: 'text-indent' }, // Matches text indent
	{ pattern: /^text-(decoration|underline-offset)-/, property: 'text' }, // Matches text-related properties
	{ pattern: /^text-(black|white|grey|gray|red|yellow|green|blue|indigo|purple|pink|.*)$/, property: 'color' }, // Matches text colors
	{ pattern: /^(underline|overline|line-through|no-underline)$/, property: 'text-decoration' }, // Matches text decoration
	{ pattern: /^(uppercase|lowercase|capitalize|normal-case)$/, property: 'text-transform' }, // Matches text transform
	{ pattern: /^(truncate|overflow-ellipsis|overflow-clip)$/, property: 'text-overflow' }, // Matches text overflow
	{ pattern: /^decoration-/, property: 'text-decoration-color' }, // Matches text decoration color
	{ pattern: /^decoration-(solid|double|dotted|dashed|wavy)$/, property: 'text-decoration-style' }, // Matches text decoration style
	{ pattern: /^decoration-\[.*\]$/, property: 'text-decoration-thickness' }, // Matches arbitrary text decoration thickness
	{ pattern: /^underline-offset-\[.*\]$/, property: 'underline-offset' }, // Matches arbitrary underline offset
	{ pattern: /^font-/, property: 'font' },
	{ pattern: /^(block|inline-block|inline|flex|grid|hidden)$/, property: 'display' },
	{ pattern: /^items-/, property: 'items' },
	{ pattern: /^justify-/, property: 'justify' },
	{ pattern: /^background-/, property: 'background' },
	{ pattern: /^(visible|invisible)$/, property: 'visibility' },
	{ pattern: /^opacity-/, property: 'opacity' },
	{ pattern: /^z-/, property: 'z' },
	{ pattern: /^self-/, property: 'self' },
	{ pattern: /^content-/, property: 'content' },
	{ pattern: /^grid(-.*)?$/, property: 'grid' },
	{ pattern: /^gap-/, property: 'gap' },
	{ pattern: /^space-/, property: 'space' },
	{ pattern: /^place-/, property: 'place' },
	{ pattern: /^leading-/, property: 'leading' },
	{ pattern: /^tracking-/, property: 'tracking' },
	{ pattern: /^list-/, property: 'list' },
	{ pattern: /^placeholder-/, property: 'placeholder' },
	{ pattern: /^order-/, property: 'order' },
	{ pattern: /^cursor-/, property: 'cursor' },
	{ pattern: /^select-/, property: 'select' },
	{ pattern: /^pointer-events-/, property: 'pointer-events' },
	{ pattern: /^resize-/, property: 'resize' },
	{ pattern: /^fill-/, property: 'fill' },
	{ pattern: /^stroke-/, property: 'stroke' },
	{ pattern: /^table-/, property: 'table' },
	{ pattern: /^transition-/, property: 'transition' },
	{ pattern: /^duration-/, property: 'duration' },
	{ pattern: /^ease-/, property: 'ease' },
	{ pattern: /^delay-/, property: 'delay' },
	{ pattern: /^animate-/, property: 'animate' },
	{ pattern: /^transform-/, property: 'transform' },
	{ pattern: /^scale-/, property: 'scale' },
	{ pattern: /^rotate-/, property: 'rotate' },
	{ pattern: /^translate-/, property: 'translate' },
	{ pattern: /^skew-/, property: 'skew' },
	{ pattern: /^origin-/, property: 'origin' },
	{ pattern: /^accent-/, property: 'accent' },
	{ pattern: /^align-/, property: 'align' },
	{ pattern: /^appearance-/, property: 'appearance' },
	{ pattern: /^backface-/, property: 'backface' },
	{ pattern: /^blend-/, property: 'blend' },
	{ pattern: /^blur-/, property: 'blur' },
	{ pattern: /^break-/, property: 'break' },
	{ pattern: /^brightness-/, property: 'brightness' },
	{ pattern: /^caret-/, property: 'caret' },
	{ pattern: /^contrast-/, property: 'contrast' },
	{ pattern: /^decoration-/, property: 'decoration' },
	{ pattern: /^filter-/, property: 'filter' },
	{ pattern: /^float-/, property: 'float' },
	{ pattern: /^clear-/, property: 'clear' },
	{ pattern: /^object-/, property: 'object' },
	{ pattern: /^outline-/, property: 'outline' },
	{ pattern: /^overscroll-/, property: 'overscroll' },
	{ pattern: /^shadow-/, property: 'shadow' },
	{ pattern: /^stroke-/, property: 'stroke' },
	{ pattern: /^transform-/, property: 'transform' },
	{ pattern: /^whitespace-/, property: 'whitespace' },
	{ pattern: /^word-/, property: 'word' },
	{ pattern: /^writing-/, property: 'writing' },
	{ pattern: /^(sr-only|not-sr-only)$/, property: 'accessibility' },
	{ pattern: /^(isolate|isolation-auto)$/, property: 'isolation' },
	{ pattern: /^mix-blend-/, property: 'mix-blend' },
	{ pattern: /^backdrop-/, property: 'backdrop' },
];

/**
 * getTailwindClasses
 * Extracts the tailwind classes from a className string,
 * takes into account overrides and returns an array of
 * final controlling classes.
 * 
 * @param {string} className 
 * @param {boolean} useCommonPatterns - whether to use common patterns or all patterns
 * @returns {array} of classes
 */
export function getTailwindClasses(className, useCommonPatterns = true) {
	if (!className) {
		return [];
	}

	const
		cssPropertyPatterns = useCommonPatterns ? commonCssPropertyPatterns : allCssPropertyPatterns,
		classes = extractTailwindClasses(className),
		propertyClassMap = new Map(),
		result = [];

	// Process classes in reverse order
	for (let i = classes.length - 1; i >= 0; i--) {
		const
			cls = classes[i],
			parts = cls.split(':'), // Split variants (e.g., 'hover:', 'sm:')
			variant = parts.length > 1 ? parts.slice(0, -1).join(':') + ':' : '',
			baseClass = parts[parts.length - 1];

		let property = null;

		// Match class against patterns
		for (const { pattern, property: prop } of cssPropertyPatterns) {
			const match = baseClass.match(pattern);
			if (match) {
				property = typeof prop === 'function' ? prop(match) : prop;
				break;
			}
		}

		if (property) {
			const key = variant + property;
			if (!propertyClassMap.has(key)) {
				propertyClassMap.set(key, cls);
				result.push(cls);
			}
		}
	}

	return result.reverse();
}

/**
 * getTailwindValue
 * Extracts the value of a CSS property from a tailwind class.
 * 
 * @param {string} className 
 * @param {string} cssProperty - like 'background-color' or 'width'
 * @returns {string|null}
 */
export function getTailwindValue(className, cssProperty, useCommonPatterns = true) {
	if (!className || !cssProperty) {
		return null;
	}

	const
		cssPropertyPatterns = useCommonPatterns ? commonCssPropertyPatterns : allCssPropertyPatterns,
		classes = getTailwindClasses(className);

	// Find the class that matches the given CSS property
	for (const cls of classes) {
		for (const { pattern, property } of cssPropertyPatterns) {
			const match = cls.match(pattern);
			if (match) {
				const resolvedProperty = typeof property === 'function' ? property(match) : property;
				if (resolvedProperty === cssProperty) {
					// Extract the value from the class
					const valueMatch = cls.match(/-(\[.*\]|[^\s]+)/);
					if (valueMatch) {
						return valueMatch[1].replace(/[\[\]]/g, ''); // Remove brackets if present
					}
				}
			}
		}
	}

	return null;
}

/**
 * hasTailwindValue
 * Checks if a tailwind class has a value
 * for a given CSS property.
 * 
 * @param {string} className 
 * @param {string} cssProperty - like 'background-color' or 'width'
 * @returns {boolean}
 */
export function hasTailwindValue(className, cssProperty) {
	const value = getTailwindValue(className, cssProperty);
	if (!value && value !== 0) {
		return false;
	}
	return true;
}

/**
 * stripClassesByProperty
 * Removes all classes that match a given CSS property.
 * 
 * @param {string} className 
 * @param {string} cssProperty like 'background-color' or 'width'
 * @returns {string}
 */
export function stripClassesByProperty(className, cssProperty, useCommonPatterns = true) {
	if (!className || !cssProperty) {
		return className;
	}
	const
		cssPropertyPatterns = useCommonPatterns ? commonCssPropertyPatterns : allCssPropertyPatterns,
		classes = extractTailwindClasses(className),
		filteredClasses = classes.filter((cls) => {
			return !cssPropertyPatterns.some((patternObj) => {
				const { pattern, property } = patternObj;
				const propertyName = typeof property === 'function' ? property(cls.match(pattern)) : property;
				return propertyName === cssProperty && pattern.test(cls);
			});
		});
	return filteredClasses.join(' ');
}

/**
 * removeToken
 * Removes a token from a tailwind class string.
 * Additional effect: replaces multiple spaces with single spaces, and trims string.
 * @param {string} className 
 * @param {string} token like 'bg-blue-300/20' 
 * @returns 
 */
export function removeToken(className, token) {
	if (!className || !token) {
		return className;
	}
	const regex = new RegExp(`\\b${token}\\b`, 'g'); //  The \b word boundary ensures that the exact class name is matched, not substrings.
	return className.replace(regex, '')
					.replace(/\s+/g, ' ') // replaces multiple spaces with a single space
					.trim();
}

/**
 * extractCssPropertyFromClassName
 * Extracts a CSS property from a tailwind class name.
 * 
 * @param {*} className 
 * @param {*} cssProperty 
 * @returns {object} { value: string|null, className: string }
 */
export function extractCssPropertyFromClassName(className, cssProperty) {
	if (!className || !cssProperty) {
		return {
			value: null,
			className,
		};
	}

	const value = getTailwindValue(className, cssProperty);
	className = stripClassesByProperty(className, cssProperty);
	return {
		value,
		className,
	};
}

/**
 * extractCssPropertyFromStyle
 * Extracts a CSS property from a style object.
 * 
 * @param {string} cssProperty like 'background-color' or 'width'
 * @param {object} style
 * @returns 
 */
export function extractCssPropertyFromStyle(style, cssProperty) {
	if (!style || !cssProperty) {
		return null;
	}
	cssProperty = Inflector.camelize(cssProperty, true); // true to lower-case the first letter
	return style[cssProperty] || null;
}

/**
 * extractCssPropertyFromProps
 * Extracts a CSS property from either style or className on props.
 * 
 * @param {object} props 
 * @param {string} cssProperty like 'background-color' or 'width'
 * @returns 
 */
export function extractCssPropertyFromProps(props, cssProperty) {
	if (!props || !cssProperty) {
		return null;
	}
	let value = extractCssPropertyFromStyle(props.style, cssProperty);
	if (value === null) {
		value = extractCssPropertyFromClassName(props.className, cssProperty).value;
	}
	return value;
}

export function extractHeight(props) {
	return extractCssPropertyFromProps(props, 'height');
}
export function hasHeight(props) {
	if (props.h && props.h !== 0) {
		return true;
	}
	const value = extractCssPropertyFromProps(props, 'height');
	if (!value && value !== 0) {
		return false;
	}
	return true;
}
export function extractWidth(props) {
	return extractCssPropertyFromProps(props, 'width');
}
export function hasWidth(props) {
	if (props.h && props.h !== 0) {
		return true;
	}
	const value = extractCssPropertyFromProps(props, 'width');
	if (!value && value !== 0) {
		return false;
	}
	return true;
}
export function extractFlex(props) {
	return extractCssPropertyFromProps(props, 'flex');
}
export function hasFlex(props) {
	if (props.flex) {
		return true;
	}
	const value = extractCssPropertyFromProps(props, 'flex');
	if (!value && value !== 0) {
		return false;
	}
	return true;
}
