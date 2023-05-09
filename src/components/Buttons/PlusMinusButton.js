import React from 'react';
import {
	Row,
	Text,
} from 'native-base';
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

		return <Row {...props}>
					<Row alignItems="center">
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
					</Row>
				</Row>;

});

export default PlusMinusButton;