import { useState } from 'react';
import {
	HStack,
} from '@project-components/Gluestack';
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
		showPagination = true,//props.Repository?.totalPages > 1,
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

	return <Toolbar
				className={`
					border-t
					border-t-grey-400
				`}
				onLayout={(e) => onLayout(e)}
			>
				{toolbarItems.length ?
					<HStack
						className={`
							PaginationToolbar-HStack
							shrink-0
							border-r
							border-r-grey-400
							mr-3
							pr-3
						`}
					>{toolbarItems}</HStack> : null}
				<Pagination
					{...propsToPass}
					showPagination={showPagination}
					w={toolbarItems.length ? null : '100%'}
					minimize={minimize}
					disablePageSize={disablePageSize}
				/>
			</Toolbar>;
};
