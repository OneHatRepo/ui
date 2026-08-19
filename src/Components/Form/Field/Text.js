import { forwardRef } from 'react';
import {
	TextNative,
} from '@onehat-gluestack';
import clsx from 'clsx';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';

const
	TextElement = (props) => {
		const {
				outerRef,
				value,
				className: incomingClassName,
				style,
				numberOfLines,
				ellipsizeMode,
				testID,
				onPress,
			} = props,
			styles = UiGlobals.styles;

		let className = clsx(
			'Text',
			'flex-1',
			'min-h-[40px]',
			'px-3',
			'py-2',
			styles.FORM_TEXT_CLASSNAME,
		);
		if (incomingClassName) {
			className += ' ' + incomingClassName;
		}
		
		return <TextNative
					ref={outerRef}
					ellipsizeMode={ellipsizeMode || 'head'}
					numberOfLines={numberOfLines}
					style={style}
					testID={testID}
					onPress={onPress}
					className={className}
				>{value}</TextNative>;
	},
	TextField = withComponent(TextElement); // NOT using withValue on Text element, as this element is simply for display purposes!

// Tooltip needs us to forwardRef
export default withTooltip(forwardRef((props, ref) => {
	return <TextField {...props} outerRef={ref} />;
}));
