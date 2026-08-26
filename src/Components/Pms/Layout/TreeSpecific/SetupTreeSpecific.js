import { Children, cloneElement } from 'react';
import MakeTreeSelection from './MakeTreeSelection';
import { useSelector } from 'react-redux';
import {
	selectSetupTreeSelection,
} from '@src/Models/Slices/AppSlice';
import _ from 'lodash';

export default function SetupTreeSpecific(props) {

	const {
			children,
			key: _key,
			...propsToPass
		} = props,
		setupTreeSelection = useSelector(selectSetupTreeSelection),
		hasTreeSelection = !_.isEmpty(setupTreeSelection);

	if (!hasTreeSelection) {
		return <MakeTreeSelection {...propsToPass} />;
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