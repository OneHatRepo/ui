import { cloneElement, useState, useEffect, useRef, } from 'react';
import {
	BoxNative,
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
import useForceUpdate from '../../Hooks/useForceUpdate.js';
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
			// components
			center,
			north,
			south,
			east,
			west,

			// configuration
			northIsResizable = false,
			southIsResizable = false,
			eastIsResizable = false,
			westIsResizable = false,

			// initial states
			northInitialHeight = null,
			southInitialHeight = null,
			eastInitialWidth = null,
			westInitialWidth = null,

			northInitialFlex = null,
			southInitialFlex = null,
			eastInitialFlex = null,
			westInitialFlex = null,

			northInitialIsCollapsed = false,
			southInitialIsCollapsed = false,
			eastInitialIsCollapsed = false,
			westInitialIsCollapsed = false,

			// optional external control of collapse states
			isNorthCollapsed = false,
			isSouthCollapsed = false,
			isEastCollapsed = false,
			isWestCollapsed = false,

			setIsNorthCollapsed: setExternalIsNorthCollapsed,
			setIsSouthCollapsed: setExternalIsSouthCollapsed,
			setIsEastCollapsed: setExternalIsEastCollapsed,
			setIsWestCollapsed: setExternalIsWestCollapsed,
		} = props,
		id = props.id || props.self?.path,
		isWeb = CURRENT_MODE === UI_MODE_WEB,
		forceUpdate = useForceUpdate(),
		centerRef = useRef(null),
		northRef = useRef(null),
		southRef = useRef(null),
		eastRef = useRef(null),
		westRef = useRef(null),
		northHeightRef = useRef(northInitialHeight),
		southHeightRef = useRef(southInitialHeight),
		eastWidthRef = useRef(eastInitialWidth),
		westWidthRef = useRef(westInitialWidth),
		[isReady, setIsReady] = useState(false),
		[localIsNorthCollapsed, setLocalIsNorthCollapsed] = useState(northInitialIsCollapsed),
		[localIsSouthCollapsed, setLocalIsSouthCollapsed] = useState(southInitialIsCollapsed),
		[localIsEastCollapsed, setLocalIsEastCollapsed] = useState(eastInitialIsCollapsed),
		[localIsWestCollapsed, setLocalIsWestCollapsed] = useState(westInitialIsCollapsed),
		setIsNorthCollapsed = (bool) => {
			if (setExternalIsNorthCollapsed) {
				setExternalIsNorthCollapsed(bool);
			} else {
				setLocalIsNorthCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-isNorthCollapsed', bool);
			}
		},
		getIsNorthCollapsed = () => {
			if (setExternalIsNorthCollapsed) {
				return isNorthCollapsed;
			}
			return localIsNorthCollapsed;
		},
		setIsSouthCollapsed = (bool) => {
			if (setExternalIsSouthCollapsed) {
				setExternalIsSouthCollapsed(bool);
			} else {
				setLocalIsSouthCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-isSouthCollapsed', bool);
			}
		},
		getIsSouthCollapsed = () => {
			if (setExternalIsSouthCollapsed) {
				return isSouthCollapsed;
			}
			return localIsSouthCollapsed;
		},
		setIsEastCollapsed = (bool) => {
			if (setExternalIsEastCollapsed) {
				setExternalIsEastCollapsed(bool);
			} else {
				setLocalIsEastCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-isEastCollapsed', bool);
			}
		},
		getIsEastCollapsed = () => {
			if (setExternalIsEastCollapsed) {
				return isEastCollapsed;
			}
			return localIsEastCollapsed;
		},
		setIsWestCollapsed = (bool) => {
			if (setExternalIsWestCollapsed) {
				setExternalIsWestCollapsed(bool);
			} else {
				setLocalIsWestCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-isWestCollapsed', bool);
			}
		},
		getIsWestCollapsed = () => {
			if (setExternalIsWestCollapsed) {
				return isWestCollapsed;
			}
			return localIsWestCollapsed;
		}
		setNorthHeight = (height) => {
			northHeightRef.current = height;
			if (id) {
				setSaved(id + '-northHeight', height);
			}
		},
		getNorthHeight = () => {
			return northHeightRef.current;
		},
		setSouthHeight = (height) => {
			southHeightRef.current = height;
			if (id) {
				setSaved(id + '-southHeight', height);
			}
		},
		getSouthHeight = () => {
			return southHeightRef.current;
		},
		setEastWidth = (width) => {
			eastWidthRef.current = width;
			if (id) {
				setSaved(id + '-eastWidth', width);
			}
		},
		getEastWidth = () => {
			return eastWidthRef.current;
		},
		setWestWidth = (width) => {
			westWidthRef.current = width;
			if (id) {
				setSaved(id + '-westWidth', width);
			}
		},
		getWestWidth = () => {
			return westWidthRef.current;
		},
		onNorthResize = (delta) => {
			const newHeight = getNorthHeight() + delta;
			setNorthHeight(newHeight);
			forceUpdate();
		},
		onSouthResize = (delta) => {
			const newHeight = getSouthHeight() - delta; // minus
			setSouthHeight(newHeight);
			forceUpdate();
		},
		onEastResize = (delta) => {
			const newWidth = getEastWidth() - delta; // minus
			setEastWidth(newWidth);
			forceUpdate();
		},
		onWestResize = (delta) => {
			const newWidth = getWestWidth() + delta;
			setWestWidth(newWidth);
			forceUpdate();
		};

	useEffect(() => {
		// Restore saved settings
		(async () => {

			if (id) {
				let key, val;
				key = id + '-isNorthCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setIsNorthCollapsed(val);
				}

				key = id + '-isSouthCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setIsSouthCollapsed(val);
				}

				key = id + '-isEastCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setIsEastCollapsed(val);
				}

				key = id + '-isWestCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setIsWestCollapsed(val);
				}

				key = id + '-northHeight';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setNorthHeight(val);
				}

				key = id + '-southHeight';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setSouthHeight(val);
				}

				key = id + '-eastWidth';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setEastWidth(val);
				}

				key = id + '-westWidth';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setWestWidth(val);
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
	
	let componentProps = null,
		wrapperProps = null,
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
		componentProps = {};
		wrapperProps = {};
		
		componentProps.className = (north.props.className || '') + ' h-full w-full';
		wrapperProps.onLayout = (e) => {
			const height = parseFloat(e.nativeEvent.layout.height);
			if (height && height !== northHeight) {
				setNorthHeight(height);
			}
		};
		const northHeight = getNorthHeight();
		if (_.isNil(northHeight)) {
			wrapperProps.style = { flex: northInitialFlex || 50, };
		} else {
			wrapperProps.style = { height: northHeight, };
		}
		if (isWeb && northIsResizable) {
			componentProps.collapseDirection = VERTICAL;
			componentProps.isCollapsed = getIsNorthCollapsed();
			componentProps.setIsCollapsed = setIsNorthCollapsed;
			northSplitter = <Splitter mode={VERTICAL} onDragStop={onNorthResize} />;
		}
		northComponent = <BoxNative className="w-full" {...wrapperProps}>
							{cloneElement(north, componentProps)}
						</BoxNative>;
	}
	if (south) {
		componentProps = {};
		wrapperProps = {};
		
		componentProps.className = (south.props.className || '') + ' h-full w-full';
		wrapperProps.onLayout = (e) => {
			const height = parseFloat(e.nativeEvent.layout.height);
			if (height && height !== southHeight) {
				setSouthHeight(height);
			}
		};
		const southHeight = getSouthHeight();
		if (_.isNil(southHeight)) {
			wrapperProps.style = { flex: southInitialFlex || 50, };
		} else {
			wrapperProps.style = { height: southHeight, };
		}
		if (isWeb && southIsResizable) {
			componentProps.collapseDirection = VERTICAL;
			componentProps.isCollapsed = getIsSouthCollapsed();
			componentProps.setIsCollapsed = setIsSouthCollapsed;
			southSplitter = <Splitter mode={VERTICAL} onDragStop={onSouthResize} />;
		}
		southComponent = <BoxNative className="w-full" {...wrapperProps}>
							{cloneElement(south, componentProps)}
						</BoxNative>;
	}
	if (east) {
		componentProps = {};
		wrapperProps = {};
		
		componentProps.className = (east.props.className || '') + ' h-full w-full';
		wrapperProps.onLayout = (e) => {
			const width = parseFloat(e.nativeEvent.layout.width);
			if (width && width !== eastWidth) {
				setEastWidth(width);
			}
		};
		const eastWidth = getEastWidth();
		if (_.isNil(eastWidth)) {
			wrapperProps.style = { flex: eastInitialFlex || 50, };
		} else {
			wrapperProps.style = { width: eastWidth, };
		}
		if (isWeb && eastIsResizable) {
			componentProps.collapseDirection = HORIZONTAL;
			componentProps.isCollapsed = getIsEastCollapsed();
			componentProps.setIsCollapsed = setIsEastCollapsed;
			eastSplitter = <Splitter mode={HORIZONTAL} onDragStop={onEastResize} />;
		}
		eastComponent = <BoxNative className="h-full" {...wrapperProps}>
							{cloneElement(east, componentProps)}
						</BoxNative>;
	}
	if (west) {
		componentProps = {};
		wrapperProps = {};
		
		componentProps.className = (west.props.className || '') + ' h-full w-full';
		wrapperProps.onLayout = (e) => {
			const width = parseFloat(e.nativeEvent.layout.width);
			if (width && width !== westWidth) {
				setWestWidth(width);
			}
		};
		const westWidth = getWestWidth();
		if (_.isNil(westWidth)) {
			wrapperProps.style = { flex: westInitialFlex || 50, };
		} else {
			wrapperProps.style = { width: westWidth, };
		}
		if (isWeb && westIsResizable) {
			componentProps.collapseDirection = HORIZONTAL;
			componentProps.isCollapsed = getIsWestCollapsed();
			componentProps.setIsCollapsed = setIsWestCollapsed;
			westSplitter = <Splitter mode={HORIZONTAL} onDragStop={onWestResize} />;
		}
		westComponent = <BoxNative className="h-full" {...wrapperProps}>
							{cloneElement(west, componentProps)}
						</BoxNative>;
	}
	
	return <VStack className="Container-all w-full flex-1">
				{northComponent}
				{!isNorthCollapsed && !localIsNorthCollapsed && northSplitter}
				<HStack className="Container-mid w-full flex-[100]">
					{westComponent}
					{!isWestCollapsed && !localIsWestCollapsed && westSplitter}
					<VStack className="Container-center h-full overflow-auto flex-[100]">
						{centerComponent}
					</VStack>
					{!isEastCollapsed && !localIsEastCollapsed && eastSplitter}
					{eastComponent}
				</HStack>
				{!isSouthCollapsed && !localIsSouthCollapsed && southSplitter}
				{southComponent}
			</VStack>;
}

export default withComponent(Container);