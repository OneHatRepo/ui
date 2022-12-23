import {
	Box,
} from 'native-base';
import _ from 'lodash';

export default function Blank(props) {
	const {
			children,
			...propsToPass
		} = props;
	return <Box {...propsToPass}>
				{children}
			</Box>;
}
