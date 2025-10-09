import {
	Box
} from '@project-components/Gluestack';
import clsx from 'clsx';

export default function CenterBox(props) {
	let className = clsx(
		'CenterBox',
		'w-full',
		'flex-1',
		'items-center',
		'justify-center',
		'p-2',
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	return <Box
				{...props}
				className={className}
			>
				{props.children}
			</Box>;
}
