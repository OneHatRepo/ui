import React from 'react';
import {
	Icon,
	Input,
	Row,
} from 'native-base';
import styles from '../../../Constants/Styles';
import IconButton from '../../Buttons/IconButton';
import withTooltip from '../../../Hoc/withTooltip';
import withValue from '../../../Hoc/withValue';
import Plus from '../../Icons/Plus';
import Minus from '../../Icons/Minus';

const
	NumberElement = (props) => {
		const {
			value = 0,
			setValue,
		} = props,
		onMinusOne = () => {
			setValue(value -1);
		},
		onPlusOne = () => {
			setValue(value +1);
		};

		return <Row flex={1} h="100%">
					<IconButton
						icon={<Icon as={Minus} />}
						onPress={onMinusOne}
						h="100%"
						w={10}
						maxWidth="25%"
						mr={1}
						bg="primary.200"
						_hover={{
							bg: 'primary.400',
						}}
					/>
					<Input
						type="number"
						ref={props.tooltipRef}
						onChangeText={props.setValue}
						flex={1}
						fontSize={styles.INPUT_FONTSIZE}
						{...props}
					/>
					<IconButton
						icon={<Icon as={Plus} />}
						onPress={onPlusOne}
						h="100%"
						w={10}
						maxWidth="25%"
						ml={1}
						bg="primary.200"
						_hover={{
							bg: 'primary.400',
						}}
					/>
				</Row>;
	},
	NumberField = withValue(NumberElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <NumberField {...props} tooltipRef={ref} />;
}));