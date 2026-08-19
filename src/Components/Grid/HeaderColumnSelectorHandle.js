import {
	Pressable,
} from '@onehat-gluestack';
import clsx from 'clsx';
import Gear from '../Icons/Gear.js';
import IconWithTooltip from '../Icons/IconWithTooltip.js';

function HeaderColumnSelectorHandle(props) {
	const {
			showColumnsSelector,
		} = props;
	return <Pressable
				_hover={{ bg: 'grey-200' }}
				_pressed={{ bg: 'grey-300' }}
				onPress={showColumnsSelector}
				className={clsx(
					'HeaderColumnSelectorHandle',
					'bg-grey-100',
					'h-full',
					'w-3',
					'items-center',
					'justify-center',
				)}
			>
				<IconWithTooltip
					as={Gear}
					size="xs"
					className="handle w-full h-full text-[#ccc]"
					tooltip="Show Columns Selector"
					tooltipTriggerClassName="h-full w-full"
				/>
			</Pressable>;
}

export default HeaderColumnSelectorHandle;
