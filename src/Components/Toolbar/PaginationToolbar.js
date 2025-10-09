import { useState, forwardRef } from 'react';
import {
	HStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import Pagination from './Pagination.js'
import Toolbar from './Toolbar.js'
import _ from 'lodash';

const PaginationToolbar = forwardRef((props, ref) => {
	const {
			toolbarItems = [],
			disablePageSize = false,
			minimize,
		} = props,
		[minimizeLocal, setMinimizeLocal] = useState(minimize),
		propsToPass = _.omit(props, 'toolbarItems'),
		showPagination = true,//props.Repository?.totalPages > 1,
		onLayout = (e) => {
			if (minimize) {
				return; // skip if already minimized
			}
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
				setMinimizeLocal(shouldMinimize);
			}
		};

	return <Toolbar
				ref={ref}
				className={clsx(
					'border-t',
					'border-t-grey-400',
				)}
				onLayout={(e) => onLayout(e)}
			>
				{toolbarItems.length ?
					<HStack
						className={clsx(
							'PaginationToolbar-HStack',
							'shrink-0',
							'border-r',
							'border-r-grey-400',
							'mr-3',
							'pr-3',
						)}
					>{toolbarItems}</HStack> : null}
				<Pagination
					{...propsToPass}
					showPagination={showPagination}
					w={toolbarItems.length ? null : '100%'}
					minimize={minimizeLocal}
					disablePageSize={disablePageSize}
				/>
			</Toolbar>;
});

export default PaginationToolbar;