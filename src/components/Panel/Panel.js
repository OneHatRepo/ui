import { useState, } from 'react';
import {
	Column,
	Row,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions';
import Header from './Header';
import emptyFn from '../../functions/emptyFn';
import _ from 'lodash';

export default function Panel(props) {
	const {
			isDisabled = false,
			isCollapsed = false,
			frame = false,
			h,
			w,
			flex,

			// Header
			title,
			header = null,
			isClosable = false,
			onClose = emptyFn,
			isCollapsible = true,
			collapseDirection = HORIZONTAL, // HORIZONTAL, VERTICAL

			// Content
			topToolbar = null,
			children = null,
			bottomToolbar = null,
			footer = null,

			...propsToPass
		} = props,
		[localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed),
		onToggleCollapse = () => {
			setLocalIsCollapsed(!localIsCollapsed);
		};

	let headerComponent = header;
	if (title) {
		headerComponent = <Header
								title={title}
								isClosable={isClosable}
								onClose={onClose}
								isCollapsible={isCollapsible}
								isCollapsed={localIsCollapsed}
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
	if (localIsCollapsed) {
		if (collapseDirection !== HORIZONTAL) {
			return <Column {...framePropsToUse} w="50px" height="100%">
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
				<Row flex={1} w="100%" {...propsToPass}>
					{children}
				</Row>
				{bottomToolbar}
				{footer}
			</Column>;
}