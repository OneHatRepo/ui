import withContextMenu from '../../Hoc/withContextMenu';
import withPresetButtons from '../../Hoc/withPresetButtons';
import withSelection from '../../Hoc/withSelection';
import withInlineEditor from '../../Hoc/withInlineEditor';
import { Grid } from './Grid';

export default withSelection(
					withInlineEditor(
						withPresetButtons(
							withContextMenu(
								Grid
							)
						)
					)
);