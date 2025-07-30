import { forwardRef } from 'react';
import {
	Icon,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import Button from './Button';
import AngleLeft from '../Icons/AngleLeft.js';

const BackButton = forwardRef((props, ref) => {
	const {
			color = 'grey-500',
			...propsToPass
		} = props,
		icon = <Icon as={AngleLeft} className={`text-${color} mr-1`} />;

	return <Button
				{...propsToPass}
				ref={ref}
				icon={icon}
				text="Back"
				_text={{
					className: `text-${color} text-[18px] -left-1`,
				}}
				className="flex-row justify-start items-center pr-[5px]"
			/>;
});

export default BackButton;