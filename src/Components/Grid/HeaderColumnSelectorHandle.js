import {
	Icon,
	Pressable,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import Gear from '../Icons/Gear.js';
import _ from 'lodash';

export default function HeaderColumnSelectorHandle(props) {
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
				<Icon
					as={Gear}
					size="xs"
					className="handle w-full h-full text-[#ccc]"
				/>
			</Pressable>;
}
