import { cloneElement, useState, useEffect, useRef, useCallback, } from 'react';
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
import getComponentFromType from '../../Functions/getComponentFromType.js';
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
			isDisabled = false,

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
		useWindowSize = getComponentFromType('useWindowSize'),
		windowSize = useWindowSize(),
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
		[isComponentsDisabled, setIsComponentsDisabled] = useState(false),
		localNorthIsCollapsedRef = useRef(northInitialIsCollapsed),
		localSouthIsCollapsedRef = useRef(southInitialIsCollapsed),
		localEastIsCollapsedRef = useRef(eastInitialIsCollapsed),
		localWestIsCollapsedRef = useRef(westInitialIsCollapsed),
		onLayout = async (e) => {
			// console.log('Container onLayout', e.nativeEvent.layout.width);
			if (id) {
				// save prevScreenSize if changed
				const
					height = parseFloat(e.nativeEvent.layout.height),
					width = parseFloat(e.nativeEvent.layout.width),
					key = id + '-prevScreenSize',
					prevScreenSize = await getSaved(key);
				if (!prevScreenSize || prevScreenSize.width !== width || prevScreenSize.height !== height) {
					await setSaved(key, {
						height,
						width,
					});

					// reset all sizes to null, so they recalculate
					setNorthHeight(null);
					setSouthHeight(null);
					setEastWidth(null);
					setWestWidth(null);
					forceUpdate();
				}
			}
		},
		debouncedOnLayout = useCallback(
			_.debounce((e) => {
				onLayout(e);
			}, 2000), // delay is signficant, as all we're trying to do is catch screen size changes
			[]
		),
		setNorthIsCollapsed = (bool) => {
			if (setExternalNorthIsCollapsed) {
				setExternalNorthIsCollapsed(bool);
			} else {
				localNorthIsCollapsedRef.current = bool;
			}

			if (id) {
				setSaved(id + '-northIsCollapsed', bool);
			}
			forceUpdate();
		},
		getNorthIsCollapsed = () => {
			if (setExternalNorthIsCollapsed) {
				return northIsCollapsed;
			}
			return localNorthIsCollapsedRef.current;
		},
		setSouthIsCollapsed = (bool) => {
			if (setExternalSouthIsCollapsed) {
				setExternalSouthIsCollapsed(bool);
			} else {
				localSouthIsCollapsedRef.current = bool;
			}

			if (id) {
				setSaved(id + '-southIsCollapsed', bool);
			}
			forceUpdate();
		},
		getSouthIsCollapsed = () => {
			if (setExternalSouthIsCollapsed) {
				return southIsCollapsed;
			}
			return localSouthIsCollapsedRef.current;
		},
		setEastIsCollapsed = (bool) => {
			if (setExternalEastIsCollapsed) {
				setExternalEastIsCollapsed(bool);
			} else {
				localEastIsCollapsedRef.current = bool;
			}

			if (id) {
				setSaved(id + '-eastIsCollapsed', bool);
			}
			forceUpdate();
		},
		getEastIsCollapsed = () => {
			if (setExternalEastIsCollapsed) {
				return eastIsCollapsed;
			}
			return localEastIsCollapsedRef.current;
		},
		setWestIsCollapsed = (bool) => {
			if (setExternalWestIsCollapsed) {
				setExternalWestIsCollapsed(bool);
			} else {
				localWestIsCollapsedRef.current = bool;
			}

			if (id) {
				setSaved(id + '-westIsCollapsed', bool);
			}
			forceUpdate();
		},
		getWestIsCollapsed = () => {
			if (setExternalWestIsCollapsed) {
				return westIsCollapsed;
			}
			return localWestIsCollapsedRef.current;
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
		},
		onSplitterDragStart = () => {
			setIsComponentsDisabled(true);
		},
		onSplitterDragStop = (delta, which) => {
			setIsComponentsDisabled(false);
			switch(which) {
				case 'north':
					onNorthResize(delta);
					break;
				case 'south':
					onSouthResize(delta);
					break;
				case 'east':
					onEastResize(delta);
					break;
				case 'west':
					onWestResize(delta);
					break;
			}
		};

	useEffect(() => {
		// Restore saved settings
		(async () => {

			if (id) {
				let key, val;

				// does screensize from previous render exist?
				key = id + '-prevScreenSize';
				val = await getSaved(key);
				let prevScreenSize = null;
				if (!_.isNil(val)) {
					prevScreenSize = val;
				}
				const currentScreenSize = {
					width: windowSize?.width ?? null,
					height: windowSize?.height ?? null,
				};
				if (!prevScreenSize || (prevScreenSize.width === currentScreenSize.width && prevScreenSize.height === currentScreenSize.height)) {
				
					// only load these saved settings if the screen size is the same as when they were saved
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


			}

			if (!isReady) {
				setIsReady(true);
			}
		})();
	}, []);

	if (!isReady) {
		return null;
	}
	
	let componentProps = { _panel: { ...center?.props?._panel }, },
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

	componentProps._panel.isCollapsible = false;
	componentProps._panel.isDisabled = isDisabled || isComponentsDisabled;
	componentProps.onLayout = debouncedOnLayout;
	centerComponent = cloneElement(center, componentProps);
	if (north) {
		componentProps = { _panel: { ...north.props?._panel }, };
		wrapperProps = {};
		
		componentProps._panel.isDisabled = isDisabled || isComponentsDisabled;
		componentProps._panel.className = 'h-full w-full ' + (north.props.className || '');
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
		componentProps._panel.collapseDirection = VERTICAL;
		componentProps._panel.isCollapsed = getNorthIsCollapsed();
		componentProps._panel.setIsCollapsed = setNorthIsCollapsed;
		if (isWeb && northIsResizable) {
			northSplitter = <Splitter
								mode={VERTICAL}
								onDragStart={onSplitterDragStart}
								onDragStop={(delta) => onSplitterDragStop(delta, 'north')}
							/>;
		}
		northComponent = <BoxNative className="northWrapper w-full" {...wrapperProps}>
							{cloneElement(north, componentProps)}
						</BoxNative>;
	}
	if (south) {
		componentProps = { _panel: { ...south.props?._panel }, };
		wrapperProps = {};
		
		componentProps._panel.isDisabled = isDisabled || isComponentsDisabled;
		componentProps._panel.className = 'h-full w-full ' + (south.props.className || '');
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
		componentProps._panel.collapseDirection = VERTICAL;
		componentProps._panel.isCollapsed = getSouthIsCollapsed();
		componentProps._panel.setIsCollapsed = setSouthIsCollapsed;
		if (isWeb && southIsResizable) {
			southSplitter = <Splitter
								mode={VERTICAL}
								onDragStart={onSplitterDragStart}
								onDragStop={(delta) => onSplitterDragStop(delta, 'south')}
							/>;
		}
		southComponent = <BoxNative className="southWrapper w-full" {...wrapperProps}>
							{cloneElement(south, componentProps)}
						</BoxNative>;
	}
	if (east) {
		componentProps = { _panel: { ...east.props?._panel }, };
		wrapperProps = {};
		
		componentProps._panel.isDisabled = isDisabled || isComponentsDisabled;
		componentProps._panel.className = 'h-full w-full ' + (east.props.className || '');
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
		componentProps._panel.collapseDirection = HORIZONTAL;
		componentProps._panel.isCollapsed = getEastIsCollapsed();
		componentProps._panel.setIsCollapsed = setEastIsCollapsed;
		if (isWeb && eastIsResizable) {
			eastSplitter = <Splitter
								mode={HORIZONTAL}
								onDragStart={onSplitterDragStart}
								onDragStop={(delta) => onSplitterDragStop(delta, 'east')}
							/>;
		}
		eastComponent = <BoxNative className="eastWrapper h-full" {...wrapperProps}>
							{cloneElement(east, componentProps)}
						</BoxNative>;
	}
	if (west) {
		componentProps = { _panel: { ...west.props?._panel }, };
		wrapperProps = {};
		
		componentProps._panel.isDisabled = isDisabled || isComponentsDisabled;
		componentProps._panel.className = 'h-full w-full ' + (west.props.className || '');
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
		componentProps._panel.collapseDirection = HORIZONTAL;
		componentProps._panel.isCollapsed = getWestIsCollapsed();
		componentProps._panel.setIsCollapsed = setWestIsCollapsed;
		if (isWeb && westIsResizable) {
			westSplitter = <Splitter
								mode={HORIZONTAL}
								onDragStart={onSplitterDragStart}
								onDragStop={(delta) => onSplitterDragStop(delta, 'west')}
							/>;
		}
		westComponent = <BoxNative className="westWrapper h-full" {...wrapperProps}>
							{cloneElement(west, componentProps)}
						</BoxNative>;
	}
	return <VStack className="Container-all w-full flex-1">
				{northComponent}
				{!getNorthIsCollapsed() && northSplitter}
				<HStack className="Container-mid w-full flex-[100]">
					{westComponent}
					{!getWestIsCollapsed() && westSplitter}
					<VStack className="Container-center h-full overflow-auto flex-[100]">
						{centerComponent}
					</VStack>
					{!getEastIsCollapsed() && eastSplitter}
					{eastComponent}
				</HStack>
				{!getSouthIsCollapsed() && southSplitter}
				{southComponent}
			</VStack>;
}

export default withComponent(Container);