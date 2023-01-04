import { useEffect, useState, } from 'react';
import Panel from '../Panel/Panel';
import Grid from '../Grid/Grid';
import _ from 'lodash';

export default function GridPanel(props) {
	const {
			_grid = {},
			disableTitleChange = false,
			selectorSelected,
			...propsToPass
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

	return <Panel title={title} {...propsToPass}>
				<Grid {..._grid} />
			</Panel>;
}