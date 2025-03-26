import { useEffect, useState, } from 'react';
import {
	Column,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions.js';
import Inflector from 'inflector-js';
import Header from './Header.js';
import Mask from './Mask.js';
import testProps from '../../functions/testProps.js';
import withCollapsible from '../Hoc/withCollapsible.js';
import withComponent from '../Hoc/withComponent.js';
import emptyFn from '../../functions/emptyFn.js';
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
			h,
			maxHeight,
			w,
			maxWidth,
			flex,
			onLayout = null,
			
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
								collapseDirection={collapseDirection}
								onToggleCollapse={onToggleCollapse}
							/>;
	}

	const sizeProps = {};
	if (!flex && !h && !w) {
		sizeProps.flex = 1;
	} else {
		if (h) {
			sizeProps.h = h;
		}
		if (w) {
			sizeProps.w = w;
		}
		if (flex) {
			sizeProps.flex = flex;
		}
	}
	if (maxWidth) {
		sizeProps.maxWidth = maxWidth;
	}
	if (maxHeight) {
		sizeProps.maxHeight = maxHeight;
	}
	// if (propsToPass.h && isCollapsed) {
	// 	delete propsToPass.h;
	// }

	const
		borderProps = {
			borderTopColor: 'primary.600',
			borderBottomColor: 'primary.600',
			borderLeftColor: 'primary.600',
			borderRightColor: 'primary.600',
		},
		nonFrameProps = {
			...borderProps,
			borderTopWidth: 0,
			borderBottomWidth: 0,
			borderLeftWidth: 0,
			borderRightWidth: 0,
		},
		frameProps = {
			...borderProps,
			borderTopWidth: 2,
			borderBottomWidth: 2,
			borderLeftWidth: 2,
			borderRightWidth: 2,
		};
	let framePropsToUse = nonFrameProps;
	if (frame) {
		framePropsToUse = frameProps;
	}

	const self = props.self;
	if (isCollapsed) {
		if (collapseDirection === HORIZONTAL) {
			return <Column {...testProps(self?.reference)} overflow="hidden" {...propsToPass} {...framePropsToUse}  {...sizeProps} w="33px">
						{isDisabled && <Mask />}
						{headerComponent}
					</Column>;
		}
		return <Column {...testProps(self?.reference)} overflow="hidden" {...propsToPass} {...framePropsToUse}  {...sizeProps} h="33px">
					{isDisabled && <Mask />}
					{headerComponent}
				</Column>;
	}
	return <Column {...testProps(self?.reference)} overflow="hidden" {...propsToPass} {...framePropsToUse} {...sizeProps} onLayout={onLayout}>
				{isDisabled && <Mask />}
				{headerComponent}
				{topToolbar}
				<Column flex={1} w="100%" overflow="hidden">
					{isScrollable ? <ScrollView>{children}</ScrollView> : children}
				</Column>
				{bottomToolbar}
				{footer}
			</Column>;

}

export default withComponent(withCollapsible(Panel));