import {
	Platform,
} from 'react-native';
import {
	HStackNative,
	ScrollView,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import UiGlobals from '../../UiGlobals.js';

export default function Toolbar(props) {
	
	const styles = UiGlobals.styles;
	
	let className = clsx(
		'Toolbar',
		'overflow-auto',
		'items-center',
		'justify-start',
		'gap-2',
		'p-2',
		'border-b',
		'border-solid',
		'border-b-grey-400',
		styles.TOOLBAR_CLASSNAME,
	);
	if (props.className) {
		className += ' ' + props.className
	}
	let toolbar = <HStackNative
						className={className}
						style={props.style || {}}
					>
						{props.children}
					</HStackNative>;	

	if (Platform.OS === 'ios' || Platform.OS === 'android') {
		toolbar = <ScrollView
						horizontal={true}
						className={clsx(
							'max-h-[50px]',
						)}
					>{toolbar}</ScrollView>;
	}

	return toolbar;
};
