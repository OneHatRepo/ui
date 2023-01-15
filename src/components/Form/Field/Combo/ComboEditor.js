import withAlert from '../../../Hoc/withAlert';
import withPresetButtons from '../../../Hoc/withPresetButtons';
import withSelection from '../../../Hoc/withSelection';
import withWindowedEditor from '../../../Hoc/withWindowedEditor';
import { Combo } from './Combo';

export default withAlert(
					withSelection(
						withWindowedEditor(
							withPresetButtons(
								Combo
							)
						)
					)
				);