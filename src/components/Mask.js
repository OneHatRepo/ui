import {
	Box,
} from 'native-base';
import _ from 'lodash';

export default function Mask(props) {
	const propsToPass = _.omit(props, 'children');
	return <Box bg="trueGray.400" {...propsToPass} testID="mask">
				{props.children}
			</Box>;
}
