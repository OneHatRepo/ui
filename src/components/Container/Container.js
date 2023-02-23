import React, { useState, } from 'react';
import {
	Column,
	Row,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import Splitter from './Splitter.js';

export default function Container(props) {
	const {
			center,
			north,
			south,
			east,
			west,

			isNorthCollapsed,
			setIsNorthCollapsed,
			isSouthCollapsed,
			setIsSouthCollapsed,
			isEastCollapsed,
			setIsEastCollapsed,
			isWestCollapsed,
			setIsWestCollapsed,
		} = props,
		canResize = CURRENT_MODE === UI_MODE_WEB,
		[localIsNorthCollapsed, setLocalIsNorthCollapsed] = useState(north ? north.props.startsCollapsed : false),
		[localIsSouthCollapsed, setLocalIsSouthCollapsed] = useState(south ? south.props.startsCollapsed : false),
		[localIsEastCollapsed, setLocalIsEastCollapsed] = useState(east ? east.props.startsCollapsed : false),
		[localIsWestCollapsed, setLocalIsWestCollapsed] = useState(west ? west.props.startsCollapsed : false),
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
		componentProps.collapseDirection = VERTICAL;
		if (!north.props.h && !north.props.flex) {
			componentProps.flex = 50;
		}
		if (canResize && north.props.isResizable) {
			if (northHeight) {
				componentProps.h = northHeight;
				componentProps.flex = null;
			}
			componentProps.w = '100%';
			componentProps.isCollapsed = setIsNorthCollapsed ? isNorthCollapsed : localIsNorthCollapsed;
			componentProps.setIsCollapsed = setIsNorthCollapsed || setLocalIsNorthCollapsed;
			componentProps.onLayout = (e) => {
				const height = parseFloat(e.nativeEvent.layout.height);
				if (height !== northHeight) {
					setNorthHeight(height);
				}
			};
			northSplitter = <Splitter mode={VERTICAL} onDragStop={onNorthResize} />;
		}
		northComponent = React.cloneElement(north, { ...componentProps, w: '100%', });
		componentProps = {};
	}
	if (south) {
		componentProps.collapseDirection = VERTICAL;
		if (!south.props.h && !south.props.flex) {
			componentProps.flex = 50;
		}
		if (canResize && south.props.isResizable) {
			if (southHeight) {
				componentProps.h = southHeight;
				componentProps.flex = null;
			}
			componentProps.w = '100%';
			componentProps.isCollapsed = setIsSouthCollapsed ? isSouthCollapsed : localIsSouthCollapsed;
			componentProps.setIsCollapsed = setIsSouthCollapsed || setLocalIsSouthCollapsed;
			componentProps.onLayout = (e) => {
				const height = parseFloat(e.nativeEvent.layout.height);
				if (height !== southHeight) {
					setSouthHeight(height);
				}
			};
			southSplitter = <Splitter mode={VERTICAL} onDragStop={onSouthResize} />;
		}
		southComponent = React.cloneElement(south, { ...componentProps, w: '100%', });
		componentProps = {};
	}
	if (east) {
		componentProps.collapseDirection = HORIZONTAL;
		if (!east.props.h && !east.props.flex) {
			componentProps.flex = 50;
		}
		if (canResize && east.props.isResizable) {
			if (eastWidth) {
				componentProps.w = eastWidth;
				componentProps.flex = null;
			}
			componentProps.h = '100%';
			componentProps.isCollapsed = setIsEastCollapsed ? isEastCollapsed : localIsEastCollapsed;
			componentProps.setIsCollapsed = setIsEastCollapsed || setLocalIsEastCollapsed;
			componentProps.onLayout = (e) => {
				const width = parseFloat(e.nativeEvent.layout.width);
				if (width !== eastWidth) {
					setEastWidth(width);
				}
			};
			eastSplitter = <Splitter mode={HORIZONTAL} onDragStop={onEastResize} />;
		}
		eastComponent = React.cloneElement(east, { ...componentProps, h: '100%', });
		componentProps = {};
	}
	if (west) {
		componentProps.collapseDirection = HORIZONTAL;
		if (!west.props.h && !west.props.flex) {
			componentProps.flex = 50;
		}
		if (canResize && west.props.isResizable) {
			if (westWidth) {
				componentProps.w = westWidth;
				componentProps.flex = null;
			}
			componentProps.h = '100%';
			componentProps.isCollapsed = setIsWestCollapsed ? isWestCollapsed : localIsWestCollapsed;
			componentProps.setIsCollapsed = setIsWestCollapsed || setLocalIsWestCollapsed;
			componentProps.onLayout = (e) => {
				const width = parseFloat(e.nativeEvent.layout.width);
				if (width !== westWidth) {
					setWestWidth(width);
				}
			};
			westSplitter = <Splitter mode={HORIZONTAL} onDragStop={onWestResize} />;
		}
		westComponent = React.cloneElement(west, { ...componentProps, h: '100%', });
		componentProps = {};
	}
	
	return <Column w="100%" flex={1}>
				{northComponent}
				{(!isNorthCollapsed && !localIsNorthCollapsed) && northSplitter}
				<Row w="100%" flex={100}>
					{westComponent}
					{(!isWestCollapsed && !localIsWestCollapsed) && westSplitter}
					<Column h="100%" flex={100}>
						{centerComponent}
					</Column>
					{(!isEastCollapsed && !localIsEastCollapsed) && eastSplitter}
					{eastComponent}
				</Row>
				{(!isSouthCollapsed && !localIsSouthCollapsed) && southSplitter}
				{southComponent}
			</Column>;
}
