import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectIcon,  SelectItem,  SelectPortal, SelectTrigger,
	Text,
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
	const {
			data = [], // in format [ [ value, label, ], ... ]
			value,
			setValue,
			onKeyPress,
			placeholder,
			disableAutoFlex = false,
			fixedWidth = true,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		style = props.style || {},
		items = data.map(([ value, label, ], key) => {
			return <SelectItem key={key} label={label} value={value} />;
		});
		
	// auto-set width to flex if it's not already set another way
	if (!disableAutoFlex && !hasWidth(props) && !hasFlex(props)) {
		style.flex = 1;
	}
	let className = clsx(
		'Select',
		'min-h-[40px]',
		'text-left',
		'rounded-lg',
		styles.FORM_SELECT_CLASSNAME,
	);
	if (props.className) {
		className += ' ' + props.className;
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
					{fixedWidth ? 
						<SelectInput
							placeholder={placeholder}
							className={clsx(
								'SelectInput',
							)}
						/> :
						<Text className="SelectText p-2">{value}</Text>}
					
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