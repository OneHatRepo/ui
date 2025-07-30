import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectIcon,  SelectItem,  SelectPortal, SelectTrigger,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	hasWidth,
	hasFlex,
} from '../../../../Functions/tailwindFunctions.js';
import UiGlobals from '../../../../UiGlobals.js';
import withComponent from '../../../Hoc/withComponent.js';
import withTooltip from '../../../Hoc/withTooltip.js';
import withValue from '../../../Hoc/withValue.js';
import CaretDown from '../../../Icons/CaretDown.js';
import _ from 'lodash';

const SelectElement = forwardRef((props, ref) => {
	let { // so localValue can be changed, if needed
			data = [], // in format [ [ value, label, ], ... ]
			value,
			setValue,
			onKeyPress,
			placeholder,
			disableAutoFlex = false,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		// debouncedSetValueRef = useRef(),
		// [localValue, setLocalValue] = useState(value),
		// onKeyPressLocal = (e) => {
		// 	if (e.key === 'Enter') {
		// 		debouncedSetValueRef.current?.cancel();
		// 		setValue(localValue);
		// 	}
		// 	if (onKeyPress) {
		// 		onKeyPress(e, localValue);
		// 	}
		// },
		items = data.map(([ value, label, ], key) => {
			return <SelectItem key={key} label={label} value={value} />;
		});
		
	// useEffect(() => {

	// 	// Set up debounce fn
	// 	// Have to do this because otherwise, lodash tries to create a debounced version of the fn from only this render
	// 	debouncedSetValueRef.current?.cancel(); // Cancel any previous debounced fn
	// 	debouncedSetValueRef.current = _.debounce(setValue, autoSubmitDelay);

	// }, [setValue]);
		
	// useEffect(() => {

	// 	if (value !== localValue) {
	// 		// Make local value conform to externally changed value
	// 		setLocalValue(value);
	// 	}

	// }, [value]);

	// if (localValue === null || typeof localValue === 'undefined') {
	// 	localValue = ''; // If the value is null or undefined, don't let this be an uncontrolled select
	// }

	const style = props.style || {};
	// auto-set width to flex if it's not already set another way
	if (!disableAutoFlex && !hasWidth(props) && !hasFlex(props)) {
		style.flex = 1;
	}
	let className = clsx(
		'Select',
		'min-h-[40px]',
		'w-full',
		'text-left',
		'rounded-lg',
		styles.FORM_SELECT_CLASSNAME,
	);
	if (props.className) {
		className += props.className;
	}

	return <Select
				{...propsToPass}
				ref={ref}
				onValueChange={setValue}
				selectedValue={value}
				closeOnOverlayClick={true}
				className={className}
				style={style}
			>
				<SelectTrigger variant="outline" size="md" className="SelectTrigger" >
					<SelectInput placeholder={placeholder} className="SelectInput" />
					<SelectIcon className="mr-3" as={CaretDown} />
				</SelectTrigger>
				<SelectPortal className="SelectPortal">
					<SelectBackdrop />
					<SelectContent className="SelectContent">
						<SelectDragIndicatorWrapper>
							<SelectDragIndicator />
						</SelectDragIndicatorWrapper>
						{items}
					</SelectContent>
				</SelectPortal>
			</Select>;
});

export default withComponent(withValue(withTooltip(SelectElement)));