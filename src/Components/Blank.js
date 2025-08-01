import { Box } from '@project-components/Gluestack';
import clsx from 'clsx';
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
