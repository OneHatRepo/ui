import UiGlobals from '../UiGlobals';
import Inflector from 'inflector-js';

export default function urlize(str) {
	return '/' + UiGlobals.urlPrefix + Inflector.dasherize(Inflector.underscore(str));
}