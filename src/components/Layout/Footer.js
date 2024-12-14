import {
	HStack,
} from '@project-components/Gluestack';
import UiGlobals from '../../UiGlobals.js';

export default function Footer(props) {
	const styles = UiGlobals.styles;
	let className = `
		Footer
		w-full
		items-center
		justify-center
		self-end
		p-2
		border-t-2
		${styles.PANEL_FOOTER_CLASSNAME}
	`;
	if (props.className) {
		className += ' ' + props.className
	}
	return <HStack
				// safeAreaBottom (see https://www.nativewind.dev/tailwind/new-concepts/safe-area-insets)
				className={className}
				style={props.style || {}}
			>
				{props.children}
			</HStack>;
}
