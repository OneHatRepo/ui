import { cloneElement, useState, useEffect, } from 'react';
import {
	HStack,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	UI_MODE_WEB,
	UI_MODE_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import withComponent from '../Hoc/withComponent.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import Splitter from './Splitter.js';
import _ from 'lodash';

// function extractTokenFromClassName(token, className) {
// 	const
// 		regex = new RegExp(
// 					'(?:^|\s)' + // match the beginning of the string or a space.
// 					token + '-' +
// 					'(\d+%?|full)' + // match a number, percentage, or 'full'
// 					'(?=\s|$)' // match the end of the string or a space
// 				),
// 		match = className.match(regex);
// 	let value = match ? match[1] : null;
// 	if (value === 'full') {
// 		value = '100%';
// 	}
// 	return value;
// }
// function extractTokenFromStyle(token, style) {
// 	return style[token] || null;
// }
// function extractHeight(props) {
// 	let height = null;
// 	if (props.style) {
// 		height = extractTokenFromStyle('height', props.style);
// 	}
// 	if (height === null && props.className) {
// 		height = extractTokenFromClassName('h', props.className);
// 	}
// 	return height;
// }
// function extractWidth(props) {
// 	let width = null;
// 	if (props.style) {
// 		width = extractTokenFromStyle('width', props.style);
// 	}
// 	if (width === null && props.className) {
// 		width = extractTokenFromClassName('w', props.className);
// 	}
// 	return width;
// }

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
		id = props.id || props.self?.path,
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

			if (id) {
				setSaved(id + '-localIsNorthCollapsed', bool);
			}
		},
		setLocalIsSouthCollapsed = (bool) => {
			setLocalIsSouthCollapsedRaw(bool);
			if (id) {
				setSaved(id + '-localIsSouthCollapsed', bool);
			}
		},
		setLocalIsEastCollapsed = (bool) => {
			setLocalIsEastCollapsedRaw(bool);
			if (id) {
				setSaved(id + '-localIsEastCollapsed', bool);
			}
		},
		setLocalIsWestCollapsed = (bool) => {
			setLocalIsWestCollapsedRaw(bool);
			if (id) {
				setSaved(id + '-localIsWestCollapsed', bool);
			}
		},
		setNorthHeight = (height) => {
			setNorthHeightRaw(height);
			if (id) {
				setSaved(id + '-northHeight', height);
			}
		},
		setSouthHeight = (height) => {
			setSouthHeightRaw(height);
			if (id) {
				setSaved(id + '-southHeight', height);
			}
		},
		setEastWidth = (width) => {
			setEastWidthRaw(width);
			if (id) {
				setSaved(id + '-eastWidth', width);
			}
		},
		setWestWidth = (width) => {
			setWestWidthRaw(width);
			if (id) {
				setSaved(id + '-westWidth', width);
			}
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

			if (id) {
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

	centerComponent = cloneElement(center, { isCollapsible: false, });
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
				if (height && height !== northHeight) {
					setNorthHeight(height);
				}
			};
			northSplitter = <Splitter mode={VERTICAL} onDragStop={onNorthResize} />;
		}
		northComponent = cloneElement(north, { ...componentProps, w: '100%', });
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
				if (height && height !== southHeight) {
					setSouthHeight(height);
				}
			};
			southSplitter = <Splitter mode={VERTICAL} onDragStop={onSouthResize} />;
		}
		southComponent = cloneElement(south, { ...componentProps, w: '100%', });
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
				if (width && width !== eastWidth) {
					setEastWidth(width);
				}
			};
			eastSplitter = <Splitter mode={HORIZONTAL} onDragStop={onEastResize} />;
		}
		eastComponent = cloneElement(east, { ...componentProps, h: '100%', });
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
				if (width && width !== westWidth) {
					setWestWidth(width);
				}
			};
			westSplitter = <Splitter mode={HORIZONTAL} onDragStop={onWestResize} />;
		}
		westComponent = cloneElement(west, { ...componentProps, h: '100%', });
		componentProps = {};
	}
	
	return <VStack className="Container-all w-full flex-1">
				{northComponent}
				{(!isNorthCollapsed && !localIsNorthCollapsed) && northSplitter}
				<HStack className="Container-mid w-full" style={{ flex: 100 }}>
					{westComponent}
					{(!isWestCollapsed && !localIsWestCollapsed) && westSplitter}
					<VStack className="Container-center h-full overflow-auto" style={{ flex: 100 }}>
						{centerComponent}
					</VStack>
					{(!isEastCollapsed && !localIsEastCollapsed) && eastSplitter}
					{eastComponent}
				</HStack>
				{(!isSouthCollapsed && !localIsSouthCollapsed) && southSplitter}
				{southComponent}
			</VStack>;
}

export default withComponent(Container);