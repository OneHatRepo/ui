import {
	Box,
} from 'native-base';
import _ from 'lodash';

export default function Tag(props) {
	const {
			children,
			...propsToPass
		} = props;
	throw new Error('Not yet implemented');
	return <Box {...propsToPass}>
				{children}
			</Box>;
}
