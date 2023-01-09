import withContextMenu from '../Hoc/withContextMenu';
import withData from '../Hoc/withData';
import withEvents from '../Hoc/withEvents';
import withFilters from '../Hoc/withFilters';
import withMultiSelection from '../Hoc/withMultiSelection';
import withPresetButtons from '../Hoc/withPresetButtons';
import withSelection from '../Hoc/withSelection';
import withWindowedEditor from '../Hoc/withWindowedEditor';
import { Grid } from './Grid';

export default withEvents(
					withData(
						withMultiSelection(
							withSelection(
								withWindowedEditor(
									withPresetButtons(
										withContextMenu(
											withFilters(
												Grid
											)
										)
									)
								)
							)
						)
					)
				);
