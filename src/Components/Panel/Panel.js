import { useEffect, useState, } from 'react';
import {
	Box,
	ScrollView,
	VStack,
	VStackNative,
} from '@onehat-gluestack';
import clsx from 'clsx';
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
			minHeight,
			maxHeight,
			maxWidth,
			disableAutoFlex = false,
			fillParentHeight = true,
			
			// Header
			title = props.model ? UiGlobals.customInflect(Inflector.camel2words(Inflector.underscore(Inflector.singularize(props.model)))) : '',
			showHeader = true,
			header = null,
			onClose,
			isCollapsible = true,
			isCollapsed = false,
			setIsCollapsed,
			collapseDirection = VERTICAL, // HORIZONTAL, VERTICAL
			disableTitleChange = false,

			// Content
			renderWhileCollapsed = false,
			topToolbar = null,
			children = null,
			bottomToolbar = null,
			footer = null,

			...propsToPass
		} = props,
		self = props.self,
		titleSelectorSelected = props.titleSelectorSelected ?? props.selectorSelected,
		titleSelectedRecord = _.isArray(titleSelectorSelected) ? titleSelectorSelected[0] : titleSelectorSelected,
		titleSelectedDisplayValue = titleSelectedRecord?.displayValue,
		selectorSuffix = titleSelectedDisplayValue ? ` for ${titleSelectedDisplayValue}` : '',
		[titleSuffix, setTitleSuffix] = useState(''),
		onToggleCollapse = () => {
			setIsCollapsed(!isCollapsed);
		};

	if (!disableTitleChange) {
		const
			[isReady, setIsReady] = useState(disableTitleChange);

		useEffect(() => {
			let titleSuffix = '';
			if (props.titleSuffix) {
				titleSuffix += ' ' + props.titleSuffix;
			}
			if (selectorSuffix) {
				titleSuffix += selectorSuffix;
			} 
			setTitleSuffix(titleSuffix);
			if (!isReady) {
				setIsReady(true);
			}
		}, [selectorSuffix, props.titleSuffix]);
	
		if (!isReady) {
			return null;
		}
	}
	
	let headerComponent = header;
	if (showHeader && title) {
		const
			normalizedTitle = selectorSuffix && title.includes(selectorSuffix) ? title.replace(selectorSuffix, '') : title,
			headerTitle = `${normalizedTitle}${titleSuffix}`.replace(/\s+/g, ' ').trim();
		headerComponent = <Header
								title={headerTitle}
								onClose={onClose}
								isCollapsible={isCollapsible}
								isCollapsed={isCollapsed}
								isWindow={isWindow}
								collapseDirection={collapseDirection}
								onToggleCollapse={onToggleCollapse}
							/>;
	}

	let className = 'Panel';
	const
		style = props.style || {},
		hasExplicitHeight = !_.isNil(style.height),
		hasMinimumHeight = !_.isNil(minHeight),
		shouldFillContentHeight = fillParentHeight && (hasExplicitHeight || hasMinimumHeight || _.isNil(maxHeight)),
		hasHeightConstraints = hasExplicitHeight || !_.isNil(minHeight) || !_.isNil(maxHeight),
		scrollViewContentContainerStyle = {
			...(hasExplicitHeight || hasMinimumHeight ? { height: '100%', } : {}),
			...(shouldFillContentHeight ? { flexGrow: 1, } : {}),
			...(hasHeightConstraints ? { justifyContent: 'center', } : {}),
		};
	if (!hasWidth(props) && !hasFlex(props) && !disableAutoFlex) {
		style.flex = 1;
	}
	if (maxWidth) {
		style.maxWidth = maxWidth;
	}
	if (minHeight) {
		style.minHeight = minHeight;
	}
	if (maxHeight) {
		style.maxHeight = maxHeight;
	}
	
	// Handle collapsed state and filter conflicting classes
	let filteredClassName = props.className;
	if (isCollapsed) {
		if (collapseDirection === HORIZONTAL) {
			if (filteredClassName) {
				// Remove any width-related classes from props.className to prevent conflicts
				filteredClassName = filteredClassName.replace(/\b(w-\S+|width-\S+|min-w-\S+|max-w-\S+)\b/g, '').trim();
			}
			className += ' w-[33px]';
			delete style.width;
		} else {
			if (filteredClassName) {
				// Remove any height-related classes from props.className to prevent conflicts
				filteredClassName = filteredClassName.replace(/\b(h-\S+|height-\S+|min-h-\S+|max-h-\S+)\b/g, '').trim();
			}
			className += ' h-[33px]';
			delete style.height;
		}
	}

	// frame
	className += ' border-grey-300' + (isWindow ? ' rounded-lg shadow-lg ' : '') + (frame ? ' border-2' : ' border-none');

	if (filteredClassName) {
		className += ' ' + filteredClassName;
	}

	let content = <>
					{topToolbar}
					<VStack
						className={clsx(
							'Panel-VSstack',
							shouldFillContentHeight && 'flex-1',
							hasHeightConstraints && !isScrollable && 'justify-center',
							'w-full',
							'overflow-hidden',
						)}
					>
						{isScrollable ?
							<ScrollView
								className="Panel-ScrollView"
								contentContainerStyle={!_.isEmpty(scrollViewContentContainerStyle) ? scrollViewContentContainerStyle : undefined}
							>
								{children}
							</ScrollView> : 
							children}
					</VStack>
					{bottomToolbar}
					{footer}
				</>;
	if (renderWhileCollapsed) {
		content = <Box
					className={clsx(
						'Panel-Box',
						...(isCollapsed ? 
							[
								'w-[0px]',
								'h-[0px]',
								'overflow-hidden',
							] :
							[
								'w-full',
								'h-full',
							])
					)}
				>
					{content}
				</Box>;
	} else {
		if (isCollapsed) {
			// hide the content when collapsed
			content = null;
		}
	}
	

	return <VStackNative
				{...testProps(self?.reference)}
				className={className}
				style={style}
			>
				{isDisabled && <Mask />}
				{headerComponent}
				{content}
			</VStackNative>;

}

export default withComponent(withCollapsible(Panel));