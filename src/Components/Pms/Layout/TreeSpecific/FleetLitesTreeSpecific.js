import { Children, cloneElement } from 'react';
import MakeTreeSelection from './MakeTreeSelection';
import { useSelector } from 'react-redux';
import {
	selectFleetLitesTreeSelection,
} from '@src/Models/Slices/AppSlice';
import _ from 'lodash';

export default function FleetLitesTreeSpecific(props) {

	const {
			children,
			key: _key,
			...propsToPass
		} = props,
		fleetLitesTreeSelection = useSelector(selectFleetLitesTreeSelection),
		hasTreeSelection = !_.isEmpty(fleetLitesTreeSelection);

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