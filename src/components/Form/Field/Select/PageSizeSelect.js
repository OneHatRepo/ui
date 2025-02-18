import { useMemo, } from 'react';
import {
	HStack,
} from '@project-components/Gluestack';
import Select from './Select.js';

export default function PageSizeSelect(props) {
	const {
			Repository,
			pageSize,
		} = props;

	return useMemo(() => {
		return <HStack className="PageSizeSelect-HStack w-[70px] ml-3">
					<Select
						data={[
							// [ 1, '1', ],
							[ 5, '5', ],
							[ 10, '10', ],
							[ 20, '20', ],
							[ 50, '50', ],
							[ 100, '100', ],
						]}
						value={pageSize}
						onChangeValue={(value) => Repository.setPageSize(value)}
						tooltip="Page Size"
						tooltipClassName="w-[70px]"
					/>
				</HStack>;
	}, [
		Repository,
		pageSize,
	]);
}
