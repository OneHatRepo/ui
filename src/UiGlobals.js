import { CURRENT_MODE } from './Constants/UiModes.js';
import Styles from './Constants/Styles.js';
import _ from 'lodash';


const Globals = {
	mode: CURRENT_MODE,
	customInflect: (str) => str,

	// global defaults
	paginationIsShowMoreOnly: false,
	autoAdjustPageSizeToHeight: true,
	doubleClickingGridRowOpensEditorInViewMode: false,
	disableSavedColumnsConfig: true,
	autoSubmitDelay: 500,
	// stayInEditModeOnSelectionChange: true,
	// isSideEditorAlwaysEditMode: true,

	styles: {
		...Styles,
	},
};

export default Globals;

export function setGlobals(globals) {
	_.merge(Globals, globals);
}