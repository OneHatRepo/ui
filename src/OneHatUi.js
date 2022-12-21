/** @module OneHatUi */

import EventEmitter from '@onehat/events';
import _ from 'lodash';

/**
 * @extends EventEmitter
 */
export class OneHatUi extends EventEmitter {

	constructor() {
		super(...arguments);


		this.registerEvents([
			'error',
		]);
	}

};

// Create and export a singleton
const oneHatUi = new OneHatUi();
export default oneHatUi;
