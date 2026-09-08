import {
	HStack,
	Tooltip,
} from '@onehat-gluestack';
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
import testProps from '../../../Functions/testProps.js';
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

	const className = clsx(
		'Json',
		'flex-1',
		'justify-start',
		'w-full',
		propsToPass.className,
	);
	// if (CURRENT_MODE === UI_MODE_WEB) {
		const src = value ? JSON.parse(value) : {};
		assembledComponents = 
			<HStack
				testID={testID}
				data-json-value={_.isNil(value) ? '' : String(value)}
				style={propsToPass.style}
				className={className}
			>
				<textarea
					{...testProps('input')}
					value={_.isNil(value) ? '' : String(value)}
					onChange={(e) => {
						const raw = e.target.value;
						setValue(raw === '' ? null : raw);
					}}
					style={{
						position: 'absolute',
						left: '-9999px',
						opacity: 0,
						height: 1,
						width: 1,
					}}
				/>
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
