import { Text } from '@onehat-gluestack';
import clsx from 'clsx';

export default function Unauthorized(props) {
	return <Text
				{...props}
				className={clsx(
					'text-red-500',
					'justify-center',
					'items-center',
					'p-3',
					props.className,
				)}
			>Unauthorized</Text>;
};