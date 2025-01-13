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
					w-full
				`}
				onLayout={(e) => onLayout(e)}
			>
				<Pagination
					{...propsToPass}
					showPagination={showPagination}
					w={toolbarItems.length ? null : '100%'}
					minimize={minimize}
					disablePageSize={disablePageSize}
				/>
				{toolbarItems.length ?
					<HStack className={`
						PaginationToolbar-HStack
						flex-1
						space-x-1
						border-l
						border-l-grey-400
						ml-3
						pl-3
					`}
					>{toolbarItems}</HStack> : null}
			</Toolbar>;
};
