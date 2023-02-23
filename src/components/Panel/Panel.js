import {
	Column,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import Header from './Header.js';
import Mask from './Mask.js';
import withCollapsible from '../Hoc/withCollapsible.js';
import emptyFn from '../../Functions/emptyFn.js';
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
			title = props.model,
			titleSuffix = '',
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
								title={title + titleSuffix}
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
		if (collapseDirection === HORIZONTAL) {
			return <Column overflow="hidden" {...propsToPass} {...framePropsToUse} w="33px" h="100%">
						{isDisabled && <Mask />}
						{headerComponent}
					</Column>;
		}
		return <Column overflow="hidden" {...propsToPass} {...framePropsToUse} h="33px" w="100%">
					{isDisabled && <Mask />}
					{headerComponent}
				</Column>;
	}
	return <Column overflow="hidden" {...propsToPass} onLayout={onLayout} {...framePropsToUse} {...sizeProps}>
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

export default withCollapsible(Panel);