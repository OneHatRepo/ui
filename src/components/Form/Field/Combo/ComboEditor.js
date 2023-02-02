import withAlert from '../../../Hoc/withAlert';
import withData from '../../../Hoc/withData';
import withPresetButtons from '../../../Hoc/withPresetButtons';
import withSelection from '../../../Hoc/withSelection';
import withValue from '../../../Hoc/withValue';
import withWindowedEditor from '../../../Hoc/withWindowedEditor';
import { Combo } from './Combo';

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