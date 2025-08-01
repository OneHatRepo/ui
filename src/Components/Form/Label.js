import {
	HStack,
	TextNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import styles from '../../Constants/Styles.js';

export default function Label(props) {
	let className = clsx(
		'Label',
		'items-center',
		'min-w-[120px]',
		'pl-2',
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	let textClassName = clsx(
		'Label-TextNative',
		'inline-block',
		'text-ellipsis',
		'text-base',
		'w-full',
		styles.FORM_LABEL_CLASSNAME,
	);
	if (props._text?.className) {
		textClassName += ' ' + props._text.className;
	}
	
	return <HStack
				className={className}
				style={props.style || {}}
			>
				<TextNative
					numberOfLines={1}
					ellipsizeMode="head"
					className={textClassName}
				>{props.children}</TextNative>
			</HStack>;
}
