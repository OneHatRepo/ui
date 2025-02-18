import { useMemo, } from 'react';
import {
	HStack,
} from '@project-components/Gluestack';
import ArrayCombo from './ArrayCombo.js';

export default function PageSizeCombo(props) {
	const {
			Repository,
			pageSize,
		} = props;

	return useMemo(() => {
		return <HStack className="w-[100px] ml-1">
					<ArrayCombo
						data={[
							// [ 1, '1/pg', ],
							[ 5, '5/pg', ],
							[ 10, '10/pg', ],
							[ 20, '20/pg', ],
							[ 50, '50/pg', ],
							[ 100, '100/pg', ],
						]}
						value={pageSize}
						onChangeValue={(value) => Repository.setPageSize(value)}
						tooltip="Page Size"
						tooltipClassName="w-[100px]"
						allowNull={false}
						disableDirectEntry={true}
					/>
				</HStack>;
	}, [
		Repository,
		pageSize,
	]);
}
