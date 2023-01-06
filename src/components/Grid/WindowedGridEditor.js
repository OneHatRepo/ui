import withContextMenu from '../../Hoc/withContextMenu';
import withPresetButtons from '../../Hoc/withPresetButtons';
import withSelection from '../../Hoc/withSelection';
import withMultiSelection from '../../Hoc/withMultiSelection';
import withWindowedEditor from '../../Hoc/withWindowedEditor';
import { Grid } from './Grid';

export default withMultiSelection(
					withSelection(
						withWindowedEditor(
							withPresetButtons(
								withContextMenu(
									Grid
								)
							)
						)
					)
				);