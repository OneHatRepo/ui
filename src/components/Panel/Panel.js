import { useEffect, useState, } from 'react';
import {
	ScrollView,
	VStack,
	VStackNative,
} from '../Gluestack';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	hasWidth,
	hasFlex,
} from '../../Functions/tailwindFunctions.js';
import Inflector from 'inflector-js';
import Header from './Header.js';
import Mask from './Mask.js';
import testProps from '../../Functions/testProps.js';
import withCollapsible from '../Hoc/withCollapsible.js';
import withComponent from '../Hoc/withComponent.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';

// Note on collapseDirections:
// HORIZONTAL means the Panel collapses along the X axis.
// VERTICAL means the Panel collapses along the Y axis.

function Panel(props) {

	const {
			isDisabled = false,
			frame = false,
			isScrollable = false,
			isWindow = false,
			maxHeight,
			maxWidth,
			disableAutoFlex = false,
			
			// Header
			title = props.model ? UiGlobals.customInflect(Inflector.camel2words(Inflector.underscore(props.model))) : '',
			showHeader = true,
			header = null,
			onClose,
			isCollapsible = true,
			isCollapsed = false,
			setIsCollapsed,
			collapseDirection = VERTICAL, // HORIZONTAL, VERTICAL
			disableTitleChange = false,

			// Content
			topToolbar = null,
			children = null,
			bottomToolbar = null,
			footer = null,

			...propsToPass
		} = props,
		self = props.self,
		[titleSuffix, setTitleSuffix] = useState(''),
		onToggleCollapse = () => {
			setIsCollapsed(!isCollapsed);
		};

	if (!disableTitleChange) {
		const
			selectorSelected = props.selectorSelected,
			[isReady, setIsReady] = useState(disableTitleChange);

		useEffect(() => {
			let titleSuffix = '';
			if (props.titleSuffix) {
				titleSuffix += ' ' + props.titleSuffix;
			}
			if (selectorSelected?.[0]?.displayValue) {
				titleSuffix += ' for ' + selectorSelected[0].displayValue;
			} 
			setTitleSuffix(titleSuffix);
			if (!isReady) {
				setIsReady(true);
			}
		}, [selectorSelected, props.titleSuffix]);
	
		if (!isReady) {
			return null;
		}
	}
	
	let headerComponent = header;
	if (showHeader && title) {
		headerComponent = <Header
								title={title + titleSuffix}
								onClose={onClose}
								isCollapsible={isCollapsible}
								isCollapsed={isCollapsed}
								isWindow={isWindow}
								collapseDirection={collapseDirection}
								onToggleCollapse={onToggleCollapse}
							/>;
	}

	let className = 'Panel';
	const style = props.style || {};
	if (!hasWidth(props) && !hasFlex(props) && !disableAutoFlex) {
		style.flex = 1;
	}
	if (maxWidth) {
		style.maxWidth = maxWidth;
	}
	if (maxHeight) {
		style.maxHeight = maxHeight;
	}
	if (isCollapsed) {
		if (collapseDirection === HORIZONTAL) {
			className += ' w-[33px]';
		} else {
			className += ' h-[33px]';
		}
	}

	// frame
	className += ' border-primary-600' + (isWindow ? ' rounded-lg shadow-lg ' : '') + (frame ? ' border-2' : ' border-none');

	if (props.className) {
		className += ' ' + props.className;
	}

	return <VStackNative
				{...testProps(self?.reference)}
				className={className}
				style={style}
			>
				{isDisabled && <Mask />}
				{headerComponent}
				{!isCollapsed && <>
					{topToolbar}
					<VStack
						className={`
							Panel-VSstack
							flex-1
							flex
							w-full
							overflow-hidden
						`}
					>
						{isScrollable ? 
							<ScrollView className="ScrollView">
								{children}
							</ScrollView> : 
							children}
					</VStack>
					{bottomToolbar}
					{footer}
				</>}
			</VStackNative>;

}

export default withComponent(withCollapsible(Panel));