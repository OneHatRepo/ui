import React from 'react';
import {
	HStack,
	Text,
} from '@gluestack-ui/themed';
import IconButton from './IconButton.js';
import Plus from '../Icons/Plus.js';
import Minus from '../Icons/Minus.js';


const PlusMinusButton = React.forwardRef((props, ref) => {

	const {
			isPlusDisabled = false,
			isMinusDisabled = false,
			plusHandler = () => {},
			minusHandler = () => {},
		} = props;

		return <HStack {...props}>
					<HStack alignItems="center">
						<IconButton
							icon={<Minus color="#fff" />}
							onPress={minusHandler}
							bg="primary.200"
							isDisabled={isMinusDisabled}
						/>
						<IconButton
							icon={<Plus color="#fff" />}
							onPress={plusHandler}
							bg="primary.200"
							isDisabled={isPlusDisabled}
							ml={1}
						/>
					</HStack>
				</HStack>;

});

export default PlusMinusButton;