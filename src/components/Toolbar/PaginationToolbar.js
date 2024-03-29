import { useState } from 'react';
import {
	Row,
} from 'native-base';
import Pagination from './Pagination.js'
import Toolbar from './Toolbar.js'
import _ from 'lodash';

export default function PaginationToolbar(props) {
	const {
			toolbarItems = [],
			disablePageSize = false,
		} = props,
		[minimize, setMinimize] = useState(false),
		propsToPass = _.omit(props, 'toolbarItems'),
		showPagination = props.Repository?.totalPages > 1,
		onLayout = (e) => {
			// Note to future self: this is using hard-coded values.
			// Eventually might want to make it responsive to actual sizes

			// Also, eventually might useMediaQuery from NativeBase, but ReactNative is not yet supported,
			// so have to do things the long way. 
			const
				width = e.nativeEvent.layout.width,
				pagingToolbarMinwidth = 576,
				toolbarItemsMinwidth = 45 * toolbarItems.length,
				threshold = pagingToolbarMinwidth + toolbarItemsMinwidth,
				shouldMinimize = width < threshold;

			if (shouldMinimize !== minimize) {
				setMinimize(shouldMinimize);
			}
		};

	let toolbarProps = {};
	if (showPagination) {
		toolbarProps = {
			borderLeftWidth: 1,
			borderLeftColor: 'trueGray.400',
			pl: 3,
			ml: 3,
		};
	}

	return <Toolbar
				bg="trueGray.200"
				borderTopWidth={1}
				borderTopColor="trueGray.400"
				w="100%"
				onLayout={(e) => onLayout(e)}
			>
				<Pagination {...propsToPass} showPagination={showPagination} w={toolbarItems.length ? null : '100%'} minimize={minimize} disablePageSize={disablePageSize} />
				{toolbarItems.length ? <Row flex={1} {...toolbarProps}>{toolbarItems}</Row> : null}
			</Toolbar>;
};
