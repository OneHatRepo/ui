/** @module OneHatUi */

import EventEmitter from '@onehat/events';
import Components from './Components/index.js';
import Styles from './Constants/Styles.js';
import UiGlobals from './UiGlobals.js';
import _ from 'lodash';

/**
 * @extends EventEmitter
 */
export class OneHatUi extends EventEmitter {

	constructor() {
		super(...arguments);

		UiGlobals.components = Components;
		UiGlobals.styles = Styles;

		this.registerEvents([
			'error',
		]);
	}

};

// Create and export a singleton
const oneHatUi = new OneHatUi();
export default oneHatUi;
