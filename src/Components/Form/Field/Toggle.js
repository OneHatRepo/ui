import React, { useRef, } from 'react';
import {
	HStack,
	Icon,
	Pressable,
	Switch,
	TextNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import UiGlobals from '../../../UiGlobals.js';
import IconButton from '../../Buttons/IconButton.js';
import Na from '../../Icons/Na.js';
import testProps from '../../../Functions/testProps.js';
import withComponent from '../../Hoc/withComponent.js';
import withTooltip from '../../Hoc/withTooltip.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const
	ToggleElement = (props) => {
		const {
				value,
				setValue,
				onText = 'Yes',
				offText = 'No',
				flex, // flex doesn't work right on mobile
				...propsToPass
			} = props,
			isBlocked = useRef(false),
			styles = UiGlobals.styles,
			onToggle = (val, e) => {
				if (!isBlocked.current) {
					setValue(!value);
				}
			},
			onNullify = (e) => {
				if (e.shiftKey) {
					// If user presses shift key while pressing...
					// Set value to null, and tempoarily disable the onToggle method
					setValue(null);
					isBlocked.current = true;
					setTimeout(() => {
						isBlocked.current = false;
					}, 200);
				}
			};

		let className = clsx(
			'Toggle',
			'h-full',
			'items-center',
			'py-[2px]',
		);
		if (props.className) {
			className += ' ' + props.className;
		}

		if (_.isNil(value)) {
			return <HStack className={className}>
						<IconButton
							{...testProps('naBtn')}
							ref={props.outerRef}
							icon={Na}
							_icon={{
								className: 'text-grey-400',
							}}
							onPress={onToggle}
							className={clsx(
								'border',
								'border-grey-700',
							)}
						/>
					</HStack>;
		}

		return <HStack className={className}>
					<Pressable
						{...testProps('nullifyBtn')}
						onPress={onNullify}
						className="justify-start"
					>
						<Switch
							ref={props.outerRef}
							onToggle={onToggle}
							value={!!value}
							size={styles.FORM_TOGGLE_SIZE}
							trackColor={{
								false: styles.FORM_TOGGLE_OFF_COLOR,
								true: styles.FORM_TOGGLE_ON_COLOR,
							}}
							thumbColor="#eee"
							activeThumbColor="#eee"
							{...propsToPass}
						/>
					</Pressable>
					<Pressable
						{...testProps('readoutBtn')}
						onPress={onToggle}
					>
						<TextNative
							{...testProps('readout')}
							className={clsx(
								'ml-1',
								'mr-2',
								styles.FORM_TOGGLE_READOUT_CLASSNAME,
							)}
						>{_.isNil(value) ? 'N/A' : (!!value ? onText : offText)}</TextNative>
					</Pressable>
				</HStack>;
	},
	ToggleField = withComponent(withValue(ToggleElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <ToggleField {...props} outerRef={ref} />;
}));