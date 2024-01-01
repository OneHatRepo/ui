import {
	Box,
} from '@gluestack-ui/themed';
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
