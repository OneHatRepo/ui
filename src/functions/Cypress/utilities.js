import moment from 'moment';

//    __  ____  _ ___ __  _
//   / / / / /_(_) (_) /_(_)__  _____
//  / / / / __/ / / / __/ / _ \/ ___/
// / /_/ / /_/ / / / /_/ /  __(__  )
// \____/\__/_/_/_/\__/_/\___/____/

export function bootstrapRouteWaiters() {
	cy.log('bootstrapRouteWaiters');
	cy.intercept('GET', '**/get**').as('getWaiter');
	cy.intercept('POST', '**/add**').as('addWaiter');
	cy.intercept('POST', '**/edit**').as('editWaiter');
	cy.intercept('POST', '**/delete**').as('deleteWaiter');
	cy.intercept('GET', '**/getReport**').as('getReportWaiter');
	cy.intercept('POST', '**/getReport**').as('postReportWaiter');
}
export function fixInflector(str) {
	// inflector-js doesn't handle pluralization of 'equipment' correctly
	str = str.replace(/quipments/, 'quipment');

	// Don't pluralize 'SideA' or 'SideB'
	str = str.replace(/SideAs/, 'SideA');
	str = str.replace(/SideBs/, 'SideB');
	return str;
}
export function getPropertyDefinitionFromSchema(fieldName, schema) {
	return _.find(schema.model.properties, { name: fieldName });
}
export function getLastPartOfPath(path) {
	return path.split('/').pop();
}
export function unescapeHtml(html) {
	const el = document.createElement('div');
	return html.replace(/\&[#0-9a-z]+;/gi, function (enc) {
		el.innerHTML = enc;
		return el.innerText
	});
}

/**
 * Given a URL query string,
 * return an object with keyed properties
 * @param {string} urlString
 * @return {object} keyed properties
 */
export function extractKeysValuesFromQueryString(urlString) {
	var entries = (new URLSearchParams(urlString)).entries(),
		fv = {},
		entry;
	while(!(entry = entries.next()).done) {
		let [key, val] = entry.value;
		// if (/\[\]$/.test(key)) {
		// 	key = key.slice(0, -2);
		// }
		if (fv.hasOwnProperty(key)) {
			if (!_.isArray(fv[key])) {
				var tmp = fv[key];
				fv[key] = [];
				fv[key].push(tmp);
			}
			fv[key].push(val);
		} else {
			fv[key] = val;
		}
	}
	return fv;
}

/**
 * JS equivalent of PHP's urlencode
 * https://www.php.net/manual/en/function.urlencode.php
 * Author: http://kevin.vanzonneveld.net
 * @param {string} string to encode
 */
export function urlencode(str) {
	// Note: Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
	return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}

/**
 * Deep diff between two objects - i.e. an object with the new value of new & changed fields.
 * Removed fields will be set as undefined on the result.
 * Only plain objects will be deeply compared (@see _.isPlainObject)
 * 
 * Inspired by: https://gist.github.com/Yimiprod/7ee176597fef230d1451#gistcomment-2565071
 * This fork: https://gist.github.com/TeNNoX/5125ab5770ba287012316dd62231b764/
 *
 * @param  {Object} base   Object to compare with (if falsy we return object)
 * @param  {Object} object Object compared
 * @return {Object} Return a new object who represent the changed & new values
 */
export function deepDiffObj(base, object) {
	if (!object) throw new Error(`The object compared should be an object: ${object}`);
	if (!base) return object;
	const result = _.transform(object, (result, value, key) => {
		if (!_.has(base, key)) result[key] = value; // fix edge case: not defined to explicitly defined as undefined
		if (!_.isEqual(value, base[key])) {
			result[key] = _.isPlainObject(value) && _.isPlainObject(base[key]) ? deepDiffObj(base[key], value) : value;
		}
	});
	// map removed fields to undefined
	_.forOwn(base, (value, key) => {
		if (!_.has(object, key)) result[key] = undefined;
	});
	return result;
}

export const dates = {
	today: moment().format('YYYY-MM-DD'),
	todayDatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
	yesterday: moment().subtract(1, 'days').format('YYYY-MM-DD'),
	tomorrow: moment().add(1, 'days').format('YYYY-MM-DD'),
	oneMonthAgo: moment().subtract(1, 'months').format('YYYY-MM-DD'),
	oneYearAgo: moment().subtract(1, 'years').format('YYYY-MM-DD'),
	startOfThisMonth: moment().startOf('months').format('YYYY-MM-DD'),
	endOfLastMonth: moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
	twoMonthsAgo: moment().subtract(2, 'months').format('YYYY-MM-DD'),
	sixMonthsAgo: moment().subtract(6, 'months').format('YYYY-MM-DD'),
	oneMonthFromNow: moment().add(1, 'months').format('YYYY-MM-DD'),
};
