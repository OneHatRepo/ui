import UiGlobals from '../UiGlobals.js';
import _ from 'lodash';

export default function setCustomInflector(customInflector) {
	UiGlobals.customInflect = customInflector;
}
