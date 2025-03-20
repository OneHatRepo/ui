import React from 'react';
import {
	Text,
} from '@project-components/Gluestack';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';

const
	DisplayElement = (props) => {
		const {
				value,
				text = value,
			} = props,
			styles = UiGlobals.styles;
		let className = `
			DisplayField
			flex-1
			${styles.TEXT_FONTSIZE}
		`;
		if (props.className) {
			className += ' ' + props.className;
		}
		return <Text
					ref={props.outerRef}
					className={className}
					style={props.style || {}}
				>{text}</Text>;
	},
	DisplayField = withComponent(withValue(DisplayElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <DisplayField {...props} outerRef={ref} />;
}));