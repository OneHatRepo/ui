import { useEffect, useState, } from 'react';
import Panel from '../Panel/Panel';
import Grid from '../Grid/Grid';

export default function GridPanel(props) {
	const {
			_panel = {},
			_grid = {},
			disableTitleChange = false,
			selectorSelected,
		} = props,
		originalTitle = props.title || _grid.model,
		[title, setTitle] = useState(originalTitle);

	useEffect(() => {
		if (!disableTitleChange) {
			if (selectorSelected) {
				setTitle(originalTitle + ' for ' + selectorSelected.displayValue);
			} else {
				setTitle(originalTitle);
			}
		}
	}, [selectorSelected, disableTitleChange, originalTitle]);

	return <Panel title={title} {..._panel}>
				<Grid {..._grid} />
			</Panel>;
}