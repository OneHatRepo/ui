import withContextMenu from '../../../Hoc/withContextMenu';
import withPresetButtons from '../../../Hoc/withPresetButtons';
import withSelection from '../../../Hoc/withSelection';
import withWindowedEditor from '../../../Hoc/withWindowedEditor';
import { Combo } from './Grid';

export default withSelection(
					withWindowedEditor(
						withPresetButtons(
							withContextMenu(
								Combo
							)
						)
					)
				);