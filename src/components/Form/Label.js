import {
	HStack,
	TextNative,
} from '../Gluestack';
import styles from '../../Constants/Styles.js';

export default function Label(props) {
	let className = `
		Label
		items-center
		min-w-[120px]
		pl-2
	`;
	if (props.className) {
		className += ' ' + props.className;
	}
	let textClassName = `
		Label-TextNative
		text-ellipsis
		${styles.FORM_LABEL_FONTSIZE}
	`;
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
