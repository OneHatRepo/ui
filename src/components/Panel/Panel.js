import { useState, } from 'react';
import {
	Column,
} from 'native-base';
import Header from './Header';
// import Mask from './Mask';
import emptyFn from '../../functions/emptyFn';
import _ from 'lodash';

export default function Panel(props) {
	const {
			testID = 'panel',
			isDisabled = false,

			// Header
			title,
			header = null,
			isClosable = true,
			onClose = emptyFn,
			isCollapsible = true,

			// Content
			topToolbar = null,
			children = null,
			bottomToolbar = null,
			footer = null,

		} = props,
		propsToPass = _.omit(props, 'children'),
		[isCollapsed, setIsCollapsed] = useState(false),
		onToggleCollapse = () => {
			setIsCollapsed(!isCollapsed);
		};

	let headerComponent = header;
	if (title) {
		headerComponent = <Header
								title={title}
								isClosable={isClosable}
								onClose={onClose}
								isCollapsible={isCollapsible}
								isCollapsed={isCollapsed}
								onToggleCollapse={onToggleCollapse}
							/>;
	}

	if (!propsToPass.flex && !propsToPass.h) {
		propsToPass.flex = 1;
	}
	if (propsToPass.h && isCollapsed) {
		delete propsToPass.h;
	}
	propsToPass.testID = testID;

	if (isCollapsed) {
		return <Column {...propsToPass}>
					{isDisabled && <div className="mask"></div>}
					{headerComponent}
				</Column>;
	}
	// if (isDisabled) {
	// 	return <Column {...propsToPass}>
	// 				<Mask flexDirection="column" flex={1}>
	// 					{headerComponent}
	// 					{topToolbar}
	// 					{children}
	// 					{bottomToolbar}
	// 					{footer}
	// 				</Mask>
	// 			</Column>;
	// }
	return <Column {...propsToPass}>
				{isDisabled && <div className="mask"></div>}
				{headerComponent}
				{topToolbar}
				{children}
				{bottomToolbar}
				{footer}
			</Column>;
}