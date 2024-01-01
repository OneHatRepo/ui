import React, { useState, useEffect, useId, } from 'react';
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
import withComponent from '../Hoc/withComponent.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import Splitter from './Splitter.js';
import _ from 'lodash';

function Container(props) {
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
		id = useId(),
		canResize = CURRENT_MODE === UI_MODE_WEB,
		[isReady, setIsReady] = useState(false),
		[localIsNorthCollapsed, setLocalIsNorthCollapsedRaw] = useState(north ? north.props.startsCollapsed : false),
		[localIsSouthCollapsed, setLocalIsSouthCollapsedRaw] = useState(south ? south.props.startsCollapsed : false),
		[localIsEastCollapsed, setLocalIsEastCollapsedRaw] = useState(east ? east.props.startsCollapsed : false),
		[localIsWestCollapsed, setLocalIsWestCollapsedRaw] = useState(west ? west.props.startsCollapsed : false),
		[northHeight, setNorthHeightRaw] = useState(north ? north.props.h : 0),
		[southHeight, setSouthHeightRaw] = useState(south ? south.props.h : 0),
		[eastWidth, setEastWidthRaw] = useState(east ? east.props.w : 0),
		[westWidth, setWestWidthRaw] = useState(west ? west.props.w : 0),
		setLocalIsNorthCollapsed = (bool) => {
			setLocalIsNorthCollapsedRaw(bool);
			setSaved(id + '-localIsNorthCollapsed', bool);
		},
		setLocalIsSouthCollapsed = (bool) => {
			setLocalIsSouthCollapsedRaw(bool);
			setSaved(id + '-localIsSouthCollapsed', bool);
		},
		setLocalIsEastCollapsed = (bool) => {
			setLocalIsEastCollapsedRaw(bool);
			setSaved(id + '-localIsEastCollapsed', bool);
		},
		setLocalIsWestCollapsed = (bool) => {
			setLocalIsWestCollapsedRaw(bool);
			setSaved(id + '-localIsWestCollapsed', bool);
		},
		setNorthHeight = (height) => {
			setNorthHeightRaw(height);
			setSaved(id + '-northHeight', height);
		},
		setSouthHeight = (height) => {
			setSouthHeightRaw(height);
			setSaved(id + '-southHeight', height);
		},
		setEastWidth = (width) => {
			setEastWidthRaw(width);
			setSaved(id + '-eastWidth', width);
		},
		setWestWidth = (width) => {
			setWestWidthRaw(width);
			setSaved(id + '-westWidth', width);
		},
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

	useEffect(() => {
		// Restore saved settings
		(async () => {
			let key, val;
			key = id + '-localIsNorthCollapsed';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setLocalIsNorthCollapsedRaw(val);
			}

			key = id + '-localIsSouthCollapsed';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setLocalIsSouthCollapsedRaw(val);
			}

			key = id + '-localIsEastCollapsed';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setLocalIsEastCollapsedRaw(val);
			}

			key = id + '-localIsWestCollapsed';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setLocalIsWestCollapsedRaw(val);
			}

			key = id + '-northHeight';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setNorthHeightRaw(val);
			}

			key = id + '-southHeight';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setSouthHeightRaw(val);
			}

			key = id + '-eastWidth';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setEastWidthRaw(val);
			}

			key = id + '-westWidth';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setWestWidthRaw(val);
			}

			if (!isReady) {
				setIsReady(true);
			}
		})();
	}, []);

	if (!isReady) {
		return null;
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
		if (!east.props.w && !east.props.flex) {
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
		if (!west.props.w && !west.props.flex) {
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

export default withComponent(Container);