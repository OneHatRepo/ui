import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

function isRgb(color) {
	const
		regex = /^#[\w]{3,6}$/,
		matches = color.match(regex);
	return !!matches?.[0];
}

// 'color' might be in a format NativeBase uses, like '#000:alpha.20' or 'primary.200'
// Try to convert this to actual RGB colors.
export default function nbToRgb(color) {

	if (isRgb(color)) {
		// already in RGB format; simply return it
		return {
			color,
			alpha,
		};
	}
	
	const themeOverrideColors = UiGlobals?.ThemeOverrides?.colors || {};
	if (themeOverrideColors[color]) {
		color = themeOverrideColors[color];
	}

	let regex, alpha, matches;

	regex = /^([\w#\.]+)(:alpha\.([\d]{1,2}))?$/;
	matches = color.match(regex);
	if (matches[3]) {
		// alpha part exists. parse it
		alpha = parseInt(matches[3], 10) / 100;
	}
	if (matches[1]) {
		// color part exists. parse it
		color = matches[1];
		regex = /^(.+)\.([\d]{3})$/;
		matches = color.match(regex);
		if (matches) {
			// color is in dot notation, like 'primary.200'
			color = matches[1];
			const whichValue = parseInt(matches[2], 10);
			if (themeOverrideColors[color]?.[whichValue]) {
				color = themeOverrideColors[color][whichValue];
			}
		} else if (themeOverrideColors[color]) {
			// color is of form 'hover'
			color = themeOverrideColors[color];
		}

		if (!isRgb(color)) {
			color = nbToRgb(color).color;
		}
	}
	

	return {
		color,
		alpha,
	};
}
