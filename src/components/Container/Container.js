import React, { useState, } from 'react';
import {
	Box,
	Column,
	Row,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions';
import Splitter from './Splitter';

export default function Container(props) {
	const {
			center,
			north,
			south,
			east,
			west,
		} = props,
		[northHeight, setNorthHeight] = useState(north ? north.props.h : 0),
		[southHeight, setSouthHeight] = useState(south ? south.props.h : 0),
		[eastWidth, setEastWidth] = useState(east ? east.props.w : 0),
		[westWidth, setWestWidth] = useState(west ? west.props.w : 0),
		onNorthResize = (delta) => {
			const newHeight = northHeight + delta;
			setNorthHeight(newHeight);
		},
		onSouthResize = (delta) => {
			const newHeight = southHeight - delta; // minus
			setSouthHeight(newHeight);
		},
		onEastResize = (delta) => {
			const newWidth = eastWidth - delta; // minus
			setEastWidth(newWidth);
		},
		onWestResize = (delta) => {
			const newWidth = westWidth + delta;
			setWestWidth(newWidth);
		};
		
	if (!center) {
		throw new Error('center must be defined!');
	}
		
	let componentProps = {},
		centerComponent = null,
		northComponent = null,
		northSplitter = null,
		southComponent = null,
		southSplitter = null,
		eastComponent = null,
		eastSplitter = null,
		westComponent = null,
		westSplitter = null;

	centerComponent = React.cloneElement(center, { isCollapsible: false, });
	if (north) {
		componentProps.collapseDirection = HORIZONTAL;
		if (north.props.split) {
			componentProps.h = northHeight;
			northSplitter = <Splitter mode={HORIZONTAL} onResize={onNorthResize} />;
		}
		northComponent = React.cloneElement(north, { ...componentProps, w: '100%', });
	}
	if (south) {
		componentProps.collapseDirection = HORIZONTAL;
		if (south.props.split) {
			componentProps.h = southHeight;
			southSplitter = <Splitter mode={HORIZONTAL} onResize={onSouthResize} />;
		}
		southComponent = React.cloneElement(south, { ...componentProps, w: '100%', });
	}
	if (east) {
		componentProps.collapseDirection = VERTICAL;
		if (east.props.split) {
			componentProps.w = eastWidth;
			eastSplitter = <Splitter mode={VERTICAL} onResize={onEastResize} />;
		}
		eastComponent = React.cloneElement(east, { ...componentProps, h: '100%', });
	}
	if (west) {
		componentProps.collapseDirection = VERTICAL;
		if (west.props.split) {
			componentProps.w = westWidth;
			westSplitter = <Splitter mode={VERTICAL} onResize={onWestResize} />;
		}
		westComponent = React.cloneElement(west, { ...componentProps, h: '100%', });
	}

	return <Column w="100%" flex={1}>
				{northComponent}
				{northSplitter}
				<Row h="100%" flex={1}>
					{westComponent}
					{westSplitter}
					<Column h="100%" flex={1}>
						{centerComponent}
					</Column>
					{eastSplitter}
					{eastComponent}
				</Row>
				{southSplitter}
				{southComponent}
			</Column>;
}
