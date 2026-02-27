import { Children, cloneElement } from 'react';
import MakeTreeSelection from './MakeTreeSelection';
import { useSelector } from 'react-redux';
import {
	selectTreeSelection,
} from '@src/Models/Slices/AppSlice';
import _ from 'lodash';

export default function TreeSpecific(props) {

	const {
			children,
			...propsToPass
		} = props,
		treeSelection = useSelector(selectTreeSelection),
		hasTreeSelection = !_.isEmpty(treeSelection);

	if (!hasTreeSelection) {
		return <MakeTreeSelection {...props} />;
	}

	// clone children and pass down props
	return Children.map(children, (child) => {
		if (child && typeof child === 'object' && child.type) {
			// valid React element
			return cloneElement(child, propsToPass);
		}
		return child;
	});
}