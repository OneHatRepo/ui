import { useEffect, useState, } from 'react';
import Panel from './Panel.js';
import { InlineGridEditor, } from '../Grid/Grid.js';
import _ from 'lodash';

export function GridPanel(props) {
	const {
			disableTitleChange = false,
			selectorSelected,
		} = props,
		originalTitle = props.title,
		[isReady, setIsReady] = useState(disableTitleChange),
		[title, setTitle] = useState(originalTitle);

	useEffect(() => {
		if (!disableTitleChange && originalTitle) {
			let newTitle = originalTitle;
			if (selectorSelected?.[0]?.displayValue) {
				newTitle = originalTitle + ' for ' + selectorSelected[0].displayValue;
			}
			if (newTitle !== title) {
				setTitle(newTitle);
			}
		}
		if (!isReady) {
			setIsReady(true);
		}
	}, [selectorSelected, disableTitleChange, originalTitle]);

	if (!isReady) {
		return null;
	}

	return <Panel {...props} title={title}>
				<InlineGridEditor {...props} />
			</Panel>;
}

export default GridPanel;