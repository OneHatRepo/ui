import {
	HStackNative,
} from '@project-components/Gluestack';
import UiGlobals from '../../UiGlobals.js';

export default function Toolbar(props) {
	
	const styles = UiGlobals.styles;
	
	let className = `
		Toolbar
		flex
		w-full
		justify-start
		items-center
		overflow-auto
		space-x-2
		px-2
		py-2
		border-b
		border-solid
		border-b-grey-400
		${styles.TOOLBAR_CLASSNAME}
	`;
	if (props.className) {
		className += ' ' + props.className
	}
	return <HStackNative
				className={className}
				style={props.style || {}}
			>
				{props.children}
			</HStackNative>;
};
