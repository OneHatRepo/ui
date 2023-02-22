 import UiGlobals from '../UiGlobals.js';
 import _ from 'lodash';

 export default function registerStyles(newStyles) {
	 _.merge(UiGlobals.styles, newStyles);
 }