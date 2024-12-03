import tailwindConfig from '../../tailwind.config';
import gluestackConfig from '../Components/Gluestack/gluestack-ui-provider/config';
import { hslToRgb, rgbToHsl, rgbToHex, rgbaToHex, hslToHex, hslaToHex, } from './colorConversions';
import _ from 'lodash';


function getHexFromNamedColor(color) {
	const 
		twc = tailwindConfig,
		gsc = gluestackConfig;
	let rgb = [], // [255, 255, 255]
		hex = null;


	// TODO: Look up the named color

	// _.each(twc.theme.extend.colors, (colorGroup, colorGroupName) => {
	// 	if (colorGroup[color]) {
	// 		rgb = colorGroup[color];
	// 		return false;
	// 	}
	// });

	return hex;
}

function splitByCommasOrSpaces(str) {
	let ret = str;
	if (str.match(/,/)) {
		ret = str.split(',');
	} else if (str.match(/\s/)) {
		ret = str.split(' ');
	}
	return ret;
}

function convertTailwindToHex(color) {

	let hex = null,
		alpha = null,
		rgb = null,
		rgba = null,
		hsl = null,
		hsla = null;

	const
		// named color with optional opacity
		// like "red-100" or "red-100/50"
		namedColorWithOptionalOpacityRegex = new RegExp(
			'^' + 
				'([A-Za-z]+)' + // named color
				'\-' + 
				'([\d]+)' + // shade
				'(\/([\d.]+))?' + // optional alpha
			'$'
		),

		// hex color with optional opacity
		// like "[#ff5733]" or "[#ff5733/50]" or "[#ff5]" or "[#ff5/50]"
		hexColorWithOptionalOpacityRegex = new RegExp(
			'^' +
				'\[#' +
				'([0-9a-fA-F]{3,6})' + // hex color
				'(\/([\d.]+))?' + // optional alpha
				'\]' +
			'$'
		),

		// RGB color with optional opacity
		// like "[rgb(255,87,51)]" or "[rgb(255,87,51)/50]" or "[rgb(255 87 51)]" or "[rgb(255 87 51)/50]"
		rgbColorWithOptionalOpacityRegex = new RegExp(
			'^' +
				'\[' +
				'rgb\(' +
					'([\d\s,]+)' + // RGB color
				'\)' +
				'(\/([\d.]+))?' + // optional alpha
				'\]' +
			'$'
		),

		// RGBA color
		// like "[rgba(255,87,51,0.4)]" or "[rgba(255 87 51 0.4)]"
		rgbaColorRegex = new RegExp( 
			'^' +
				'\[' +
				'rgba\(' +
					'([\d\.\s,]+)' + // RGBA color
				'\)' +
				'\]' +
			'$'
		),

		// HSL color
		// like "[hsl(70deg, 100%, 50%)]" or "[hsl(70deg, 100%, 50%)/50]" or "[hsl(70deg 100% 50%)]" or "[hsl(70deg 100% 50%)/50]"
		hslColorWithOptionalOpacityRegex = new RegExp(
			'^' +
				'\[' +
				'hsl\(' +
					'([\w\s%,]+)' + // HSL color
				'\)' +
				'(\/([\d.]+))?' + // optional alpha
				'\]' +
			'$'
		),

		// HSLA color
		// like "[hsla(70deg 100% 50% 0.4)]" or "[hsla(70deg,100%,50%,0.4)]"
		hslaColorRegex = new RegExp(
			'^' +
				'\[' +
				'hsl\(' +
					'([\w\s%,]+)' + // HSL color
				'\)' +
				'(\/([\d.]+))?' + // optional alpha
				'\]' +
			'$'
		);

	if (str.match(namedColorWithOptionalOpacityRegex)) {
		
		// "red-100" or "red-100/50"
		const matches = str.match(namedColorWithOptionalOpacityRegex);
		hex = getHexFromNamedColor(matches[1]);
		if (matches[3]) {
			alpha = matches[3];
		}

	} else if (str.match(hexColorWithOptionalOpacityRegex)) {

		// "[#ff5733]" or "[#ff5733/50]" or "[#ff5]" or "[#ff5/50]"
		const matches = str.match(hexColorWithOptionalOpacityRegex);
		hex = matches[1];
		if (matches[3]) {
			alpha = matches[3];
		}

	} else if (str.match(rgbColorWithOptionalOpacityRegex)) {

		// "[rgb(255,87,51)]" or "[rgb(255,87,51)/50]" or "[rgb(255 87 51)]" or "[rgb(255 87 51)/50]"
		const
			matches = str.match(rgbColorWithOptionalOpacityRegex),
			color = matches[1],
			rgb = splitByCommasOrSpaces(color);
		if (matches[3]) {
			alpha = matches[3];
		}
	
	} else if (str.match(rgbaColorRegex)) {

		// "[rgba(255,87,51,0.4)]" or "[rgba(255 87 51 0.4)]"
		const
			matches = str.match(rgbaColorRegex),
			color = matches[1],
			rgba = splitByCommasOrSpaces(color);

	} else if (str.match(hslColorWithOptionalOpacityRegex)) {
		
		// "[hsl(70deg, 100%, 50%)]" or "[hsl(70deg, 100%, 50%)/50]" or "[hsl(70deg 100% 50%)]" or "[hsl(70deg 100% 50%)/50]"
		const
			matches = str.match(hslColorWithOptionalOpacityRegex),
			color = matches[1],
			hsl = splitByCommasOrSpaces(color);
		if (matches[3]) {
			alpha = matches[3];
		}

	} else if (str.match(hslaColorRegex)) {

		// "[hsla(70deg 100% 50% 0.4)]" or "[hsla(70deg,100%,50%,0.4)]"
		const
			matches = str.match(hslaColorRegex),
			color = matches[1],
			hsla = splitByCommasOrSpaces(color);

	}


	if (rgb) {
		hex = rgbToHex(rgb);
	} else if (rgba) {
		hex = rgbaToHex(rgba);
	} else if (hsl) {
		hex = hslToHex(hsl);
	} else if (hsla) {
		hex = hslaToHex(hsla);
	}

	return {
		hex,
		alpha,
	};
}

export default function gsToHex(className) {
	let hex = null;
	const classes = className.split(' ');
	_.each(classes, (cls) => {
		if (cls.match(/bg-/)) {
			hex = convertTailwindToHex(cls.replace('bg\-', ''));
			return false;
		}
	});
	return hex;
}
