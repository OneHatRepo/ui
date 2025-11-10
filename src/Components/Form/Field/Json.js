import {
	HStack,
	Tooltip,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_NATIVE,
	UI_MODE_WEB,
} from '../../../Constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';
import getComponentFromType from '../../../Functions/getComponentFromType.js';
import _ from 'lodash';


export function JsonElement(props) {
	const {
			tooltipRef = null,
			tooltip = null,
			isDisabled = false,
			isViewOnly = false,
			isCollapsed = true,
			tooltipPlacement = 'bottom',
			testID,

			// withComponent
			self,

			// withValue
			value,
			setValue,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		JsonEditor = getComponentFromType('JsonEditor');

	let assembledComponents = null;
	
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		throw new Error('JsonElement not yet implemented for React Native');
	}

	let className = clsx(
		'Json',
		'flex-1',
		'justify-start',
		testID,
	);
	if (props.className) {
		className += ' ' + propsToPass.className;
	}
	// if (CURRENT_MODE === UI_MODE_WEB) {
		const src = value ? JSON.parse(value) : {};
		assembledComponents = 
			<HStack style={propsToPass.style} className={className}>
				<JsonEditor
					width="100%"
					editable={!isViewOnly}
					src={src}
					enableClipboard={false}
					collapsed={isCollapsed}
					onEdit={(obj) => {
						setValue(JSON.stringify(obj.updated_src));
					}}
					collapseStringsAfterLength={500}
					{...propsToPass}
				/>
			</HStack>;
	// }
	
	if (tooltip) {
		// assembledComponents = <Tooltip label={tooltip} placement={tooltipPlacement}>
		// 						{assembledComponents}
		// 					</Tooltip>;
	}
	return assembledComponents;
}

export default withComponent(withValue(JsonElement));
