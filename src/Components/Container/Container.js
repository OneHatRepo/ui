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
			northIsCollapsed = false,
			southIsCollapsed = false,
			eastIsCollapsed = false,
			westIsCollapsed = false,

			setNorthIsCollapsed: setExternalNorthIsCollapsed,
			setSouthIsCollapsed: setExternalSouthIsCollapsed,
			setEastIsCollapsed: setExternalEastIsCollapsed,
			setWestIsCollapsed: setExternalWestIsCollapsed,
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
		[localNorthIsCollapsed, setLocalNorthIsCollapsed] = useState(northInitialIsCollapsed),
		[localSouthIsCollapsed, setLocalSouthIsCollapsed] = useState(southInitialIsCollapsed),
		[localEastIsCollapsed, setLocalEastIsCollapsed] = useState(eastInitialIsCollapsed),
		[localWestIsCollapsed, setLocalWestIsCollapsed] = useState(westInitialIsCollapsed),
		setNorthIsCollapsed = (bool) => {
			if (setExternalNorthIsCollapsed) {
				setExternalNorthIsCollapsed(bool);
			} else {
				setLocalNorthIsCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-northIsCollapsed', bool);
			}
		},
		getNorthIsCollapsed = () => {
			if (setExternalNorthIsCollapsed) {
				return northIsCollapsed;
			}
			return localNorthIsCollapsed;
		},
		setSouthIsCollapsed = (bool) => {
			if (setExternalSouthIsCollapsed) {
				setExternalSouthIsCollapsed(bool);
			} else {
				setLocalSouthIsCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-southIsCollapsed', bool);
			}
		},
		getSouthIsCollapsed = () => {
			if (setExternalSouthIsCollapsed) {
				return southIsCollapsed;
			}
			return localSouthIsCollapsed;
		},
		setEastIsCollapsed = (bool) => {
			if (setExternalEastIsCollapsed) {
				setExternalEastIsCollapsed(bool);
			} else {
				setLocalEastIsCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-eastIsCollapsed', bool);
			}
		},
		getEastIsCollapsed = () => {
			if (setExternalEastIsCollapsed) {
				return eastIsCollapsed;
			}
			return localEastIsCollapsed;
		},
		setWestIsCollapsed = (bool) => {
			if (setExternalWestIsCollapsed) {
				setExternalWestIsCollapsed(bool);
			} else {
				setLocalWestIsCollapsed(bool);
			}

			if (id) {
				setSaved(id + '-westIsCollapsed', bool);
			}
		},
		getWestIsCollapsed = () => {
			if (setExternalWestIsCollapsed) {
				return westIsCollapsed;
			}
			return localWestIsCollapsed;
		},
		setNorthHeight = (height) => {
			if (!getNorthIsCollapsed()) {
				northHeightRef.current = height;
				if (id) {
					setSaved(id + '-northHeight', height);
				}
			}
		},
		getNorthHeight = () => {
			return northHeightRef.current;
		},
		setSouthHeight = (height) => {
			if (!getSouthIsCollapsed()) {
				southHeightRef.current = height;
				if (id) {
					setSaved(id + '-southHeight', height);
				}
			}
		},
		getSouthHeight = () => {
			return southHeightRef.current;
		},
		setEastWidth = (width) => {
			if (!getEastIsCollapsed()) {
				eastWidthRef.current = width;
				if (id) {
					setSaved(id + '-eastWidth', width);
				}
			}
		},
		getEastWidth = () => {
			return eastWidthRef.current;
		},
		setWestWidth = (width) => {
			if (!getWestIsCollapsed()) {
				westWidthRef.current = width;
				if (id) {
					setSaved(id + '-westWidth', width);
				}
			}
		},
		getWestWidth = () => {
			return westWidthRef.current;
		},
		onNorthResize = (delta) => {
			if (!getNorthIsCollapsed()) {
				const newHeight = getNorthHeight() + delta;
				setNorthHeight(newHeight);
				forceUpdate();
			}
		},
		onSouthResize = (delta) => {
			if (!getSouthIsCollapsed()) {
				const newHeight = getSouthHeight() - delta; // minus
				setSouthHeight(newHeight);
				forceUpdate();
			}
		},
		onEastResize = (delta) => {
			if (!getEastIsCollapsed()) {
				const newWidth = getEastWidth() - delta; // minus
				setEastWidth(newWidth);
				forceUpdate();
			}
		},
		onWestResize = (delta) => {
			if (!getWestIsCollapsed()) {
				const newWidth = getWestWidth() + delta;
				setWestWidth(newWidth);
				forceUpdate();
			}
		};

	useEffect(() => {
		// Restore saved settings
		(async () => {

			if (id) {
				let key, val;
				key = id + '-northIsCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setNorthIsCollapsed(val);
				}

				key = id + '-southIsCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setSouthIsCollapsed(val);
				}

				key = id + '-eastIsCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setEastIsCollapsed(val);
				}

				key = id + '-westIsCollapsed';
				val = await getSaved(key);
				if (!_.isNil(val)) {
					setWestIsCollapsed(val);
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
		if (getNorthIsCollapsed()) {
			wrapperProps.style = {
				height: 33,
			};
		} else {
			const northHeight = getNorthHeight();
			if (_.isNil(northHeight)) {
				wrapperProps.style = { flex: northInitialFlex || 50, };
			} else {
				wrapperProps.style = { height: northHeight, };
			}
		}
		componentProps.collapseDirection = VERTICAL;
		componentProps.isCollapsed = getNorthIsCollapsed();
		componentProps.setIsCollapsed = setNorthIsCollapsed;
		if (isWeb && northIsResizable) {
			northSplitter = <Splitter mode={VERTICAL} onDragStop={onNorthResize} />;
		}
		northComponent = <BoxNative className="northWrapper w-full" {...wrapperProps}>
							{cloneElement(north, componentProps)}
						</BoxNative>;
	}
	if (south) {
		componentProps = {};
		wrapperProps = {};
		
		componentProps.className = (south.props.className || '') + ' h-full w-full';
		wrapperProps.onLayout = (e) => {
			const height = parseFloat(e.nativeEvent.layout.height);
			if (height && height !== getSouthHeight()) {
				setSouthHeight(height);
			}
		};
		if (getSouthIsCollapsed()) {
			wrapperProps.style = {
				height: 33,
			};
		} else {
			const southHeight = getSouthHeight();
			if (_.isNil(southHeight)) {
				wrapperProps.style = { flex: southInitialFlex || 50, };
			} else {
				wrapperProps.style = { height: southHeight, };
			}
		}
		componentProps.collapseDirection = VERTICAL;
		componentProps.isCollapsed = getSouthIsCollapsed();
		componentProps.setIsCollapsed = setSouthIsCollapsed;
		if (isWeb && southIsResizable) {
			southSplitter = <Splitter mode={VERTICAL} onDragStop={onSouthResize} />;
		}
		southComponent = <BoxNative className="southWrapper w-full" {...wrapperProps}>
							{cloneElement(south, componentProps)}
						</BoxNative>;
	}
	if (east) {
		componentProps = {};
		wrapperProps = {};
		
		componentProps.className = (east.props.className || '') + ' h-full w-full';
		wrapperProps.onLayout = (e) => {
			const width = parseFloat(e.nativeEvent.layout.width);
			if (width && width !== getEastWidth()) {
				setEastWidth(width);
			}
		};
		if (getEastIsCollapsed()) {
			wrapperProps.style = {
				width: 33,
			};
		} else {
			const eastWidth = getEastWidth();
			if (_.isNil(eastWidth)) {
				wrapperProps.style = { flex: eastInitialFlex || 50, };
			} else {
				wrapperProps.style = { width: eastWidth, };
			}
		}
		componentProps.collapseDirection = HORIZONTAL;
		componentProps.isCollapsed = getEastIsCollapsed();
		componentProps.setIsCollapsed = setEastIsCollapsed;
		if (isWeb && eastIsResizable) {
			eastSplitter = <Splitter mode={HORIZONTAL} onDragStop={onEastResize} />;
		}
		eastComponent = <BoxNative className="eastWrapper h-full" {...wrapperProps}>
							{cloneElement(east, componentProps)}
						</BoxNative>;
	}
	if (west) {
		componentProps = {};
		wrapperProps = {};
		
		componentProps.className = (west.props.className || '') + ' h-full w-full';
		wrapperProps.onLayout = (e) => {
			const width = parseFloat(e.nativeEvent.layout.width);
			if (width && width !== getWestWidth()) {
				setWestWidth(width);
			}
		};
		if (getWestIsCollapsed()) {
			wrapperProps.style = {
				width: 33,
			};
		} else {
			const westWidth = getWestWidth();
			if (_.isNil(westWidth)) {
				wrapperProps.style = { flex: westInitialFlex || 50, };
			} else {
				wrapperProps.style = { width: westWidth, };
			}
		}
		componentProps.collapseDirection = HORIZONTAL;
		componentProps.isCollapsed = getWestIsCollapsed();
		componentProps.setIsCollapsed = setWestIsCollapsed;
		if (isWeb && westIsResizable) {
			westSplitter = <Splitter mode={HORIZONTAL} onDragStop={onWestResize} />;
		}
		westComponent = <BoxNative className="westWrapper h-full" {...wrapperProps}>
							{cloneElement(west, componentProps)}
						</BoxNative>;
	}
	return <VStack className="Container-all w-full flex-1">
				{northComponent}
				{!northIsCollapsed && !localNorthIsCollapsed && northSplitter}
				<HStack className="Container-mid w-full flex-[100]">
					{westComponent}
					{!westIsCollapsed && !localWestIsCollapsed && westSplitter}
					<VStack className="Container-center h-full overflow-auto flex-[100]">
						{centerComponent}
					</VStack>
					{!eastIsCollapsed && !localEastIsCollapsed && eastSplitter}
					{eastComponent}
				</HStack>
				{!southIsCollapsed && !localSouthIsCollapsed && southSplitter}
				{southComponent}
			</VStack>;
}

export default withComponent(Container);