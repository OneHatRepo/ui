import React, { useState, useEffect, useRef, } from 'react';
import {
	Row,
	Text,
	Tooltip,
} from 'native-base';
import {
	UI_MODE_REACT_NATIVE,
	UI_MODE_WEB,
} from '../../../constants/UiModes.js';
import UiGlobals from '../../../UiGlobals.js';
import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';
import testProps from '../../../functions/testProps.js';
import getComponentFromType from '../../../functions/getComponentFromType.js';
import _ from 'lodash';


export function JsonElement(props) {
	const {
			tooltipRef = null,
			tooltip = null,
			isDisabled = false,
			isViewOnly = false,
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
	
	if (UiGlobals.mode === UI_MODE_WEB) {
		const src = JSON.parse(value);
		assembledComponents = 
			<Row
				flex={1}
				{...propsToPass}
				justifyContent="flex-start"
			>
				<JsonEditor
					width="100%"
					editable={!isViewOnly}
					src={src}
					enableClipboard={false}
					collapsed={true}
					onEdit={(obj) => {
						setValue(JSON.stringify(obj.updated_src));
					}}
				/>
			</Row>;

	}
	if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
		throw new Error('JsonElement not yet implemented for React Native');
	}
	
	if (tooltip) {
		assembledComponents = <Tooltip label={tooltip} placement={tooltipPlacement}>
								{assembledComponents}
							</Tooltip>;
	}
	return assembledComponents;
};

export default withComponent(withValue(JsonElement));
