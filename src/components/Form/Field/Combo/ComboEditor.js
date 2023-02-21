import withAlert from '../../../Hoc/withAlert.js';
import withData from '../../../Hoc/withData.js';
import withPresetButtons from '../../../Hoc/withPresetButtons.js';
import withSelection from '../../../Hoc/withSelection.js';
import withValue from '../../../Hoc/withValue.js';
import withWindowedEditor from '../../../Hoc/withWindowedEditor.js';
import { Combo } from './Combo.js';

export default
				// withAlert(
					withData(
						withValue(
							withSelection(
								withWindowedEditor(
									withPresetButtons(
										Combo
									)
								)
							)
						)
					);
				//);