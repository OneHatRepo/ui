import React from 'react';
import {
	HStack,
	HStackNative,
} from '../Gluestack';
import IconButton from './IconButton.js';
import Plus from '../Icons/Plus.js';
import Minus from '../Icons/Minus.js';


const PlusMinusButton = React.forwardRef((props, ref) => {

	const {
			isPlusDisabled = false,
			isMinusDisabled = false,
			plusHandler = () => {},
			minusHandler = () => {},
			plusTooltip,
			minusTooltip,
		} = props,
		_icon = {
			className: 'text-black',
		};

		let className = `
			PlusMinusButton-HStack
			items-center
		`;
		if (props.className) {
			className += ' ' + props.className
		}

		return <HStack className={className}>
					<IconButton
						icon={Minus}
						_icon={_icon}
						onPress={minusHandler}
						isDisabled={isMinusDisabled}
						tooltip={minusTooltip}
					/>
					<IconButton
						icon={Plus}
						_icon={_icon}
						onPress={plusHandler}
						isDisabled={isPlusDisabled}
						className="ml-1"
						tooltip={plusTooltip}
					/>
				</HStack>;

});

export default PlusMinusButton;