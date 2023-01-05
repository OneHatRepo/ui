import { useEffect, useState, } from 'react';
import Panel from './Panel';
import Grid from '../Grid/Grid';
import withData from '../Hoc/withData';
import _ from 'lodash';

export function GridPanel(props) {
	const {
			disableTitleChange = false,
			selectorSelected,
		} = props,
		originalTitle = props.title,
		[title, setTitle] = useState(originalTitle);

	useEffect(() => {
		if (!disableTitleChange && originalTitle) {
			if (selectorSelected) {
				setTitle(originalTitle + ' for ' + selectorSelected.displayValue);
			} else {
				setTitle(originalTitle);
			}
		}
	}, [selectorSelected, disableTitleChange, originalTitle]);

	return <Panel {...props} title={title}>
				<Grid {...props} />
			</Panel>;
}

export default withData(GridPanel);