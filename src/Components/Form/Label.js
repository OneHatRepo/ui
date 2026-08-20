import {
	HStack,
	TextNative,
} from '@onehat-gluestack';
import clsx from 'clsx';
import styles from '../../Constants/Styles.js';

export default function Label(props) {
	const
		className = clsx(
			'Label',
			'items-center',
			'min-w-[120px]',
			'pl-2',
			props.className,
		),
		textClassName = clsx(
			'Label-TextNative',
			'inline-block',
			'text-ellipsis',
			'text-base',
			'w-full',
			styles.FORM_LABEL_CLASSNAME,
			props._text?.className,
		);
	
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
