import { useMemo, } from 'react';
import {
	Row,
} from 'native-base';
import ArrayCombo from './ArrayCombo.js';

export default function PageSizeCombo(props) {
	const {
			Repository,
			pageSize,
		} = props;

	return useMemo(() => {
		return <Row
					w="100px"
					ml={2}
				>
					<ArrayCombo
						data={[
							// [ 1, '1/pg', ],
							[ 5, '5/pg', ],
							[ 10, '10/pg', ],
							[ 20, '20pg', ],
							[ 50, '50/pg', ],
							[ 100, '100/pg', ],
						]}
						value={pageSize}
						onChangeValue={(value) => Repository.setPageSize(value)}
						tooltip="Page Size"
						allowNull={false}
						disableDirectEntry={true}
					/>
				</Row>;
	}, [
		Repository,
		pageSize,
	]);
}
