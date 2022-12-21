import _ from 'lodash';

export default function inArray(needle, haystack) {
	return _.indexOf(haystack, needle) !== -1;
}