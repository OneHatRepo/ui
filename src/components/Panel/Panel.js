import { useState, } from 'react';
import {
	Column,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions';
import Header from './Header';
import withCollapsible from '../Hoc/withCollapsible';
import emptyFn from '../../Functions/emptyFn';
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
			w,
			flex,
			
			// Header
			title = props.model,
			showHeader = true,
			header = null,
			isClosable = false,
			onClose = emptyFn,
			isCollapsible = true,
			isCollapsed = false,
			setIsCollapsed,
			collapseDirection = VERTICAL, // HORIZONTAL, VERTICAL

			// Content
			topToolbar = null,
			children = null,
			bottomToolbar = null,
			footer = null,

			...propsToPass
		} = props,
		onToggleCollapse = () => {
			setIsCollapsed(!isCollapsed);
		};

	let headerComponent = header;
	if (showHeader && title) {
		headerComponent = <Header
								title={title}
								isClosable={isClosable}
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
			borderTopWidth: 1,
			borderBottomWidth: 1,
			borderLeftWidth: 1,
			borderRightWidth: 1,
		},
		frameProps = {
			...borderProps,
			borderTopWidth: 3,
			borderBottomWidth: 3,
			borderLeftWidth: 3,
			borderRightWidth: 3,
		};
	let framePropsToUse = nonFrameProps;
	if (frame) {
		framePropsToUse = frameProps;
	}
	if (isCollapsed) {
		if (collapseDirection !== VERTICAL) {
			return <Column {...framePropsToUse} w="33px" height="100%">
						{isDisabled && <div className="mask"></div>}
						{headerComponent}
					</Column>;
		}
		return <Column {...framePropsToUse}>
					{isDisabled && <div className="mask"></div>}
					{headerComponent}
				</Column>;
	}
	return <Column {...framePropsToUse} {...sizeProps}>
				{isDisabled && <div className="mask"></div>}
				{headerComponent}
				{topToolbar}
				<Column flex={1} w="100%" {...propsToPass}>
					{isScrollable ? <ScrollView>{children}</ScrollView> : children}
				</Column>
				{bottomToolbar}
				{footer}
			</Column>;
}

export default withCollapsible(Panel);