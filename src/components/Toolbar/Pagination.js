import { useEffect, } from 'react';
import {
	Icon,
	Row,
	Text,
} from 'native-base';
import useForceUpdate from '../../Hooks/useForceUpdate';
import IconButton from '../Buttons/IconButton';
import AngleLeft from '../Icons/AngleLeft';
import AnglesLeft from '../Icons/AnglesLeft';
import AngleRight from '../Icons/AngleRight';
import AnglesRight from '../Icons/AnglesRight';
import Rotate from '../Icons/Rotate';
import Input from '../Form/Field/Input';
import ArrayCombo from '../Form/Field/Combo/ArrayCombo';

export default function Pagination(props) {
	const {
			// withData
			Repository,
		} = props,
		{
			page,
			pageSize,
			total,
			totalPages,
			pageStart,
			pageEnd,
		} = Repository,
		forceUpdate = useForceUpdate(),
		iconButtonProps = {
			_hover: {
				bg: 'trueGray.400',
			},
			// mx: 1,
		},
		iconProps = {
			// position: 'absolute',
			alignSelf: 'center',
			size: 'sm',
			color: 'trueGray.500',
			h: 20,
			w: 20,
		};

	useEffect(() => {
		Repository.ons(['changePage', 'changePageSize', 'changeData', ], forceUpdate);
		return () => {
			Repository.offs(['changePage', 'changePageSize', 'changeData', ], forceUpdate);
		};
	}, [Repository]);

	let items = [],
		isDisabled = page === 1;
	items.push(<IconButton
					key="first"
					{...iconButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AnglesLeft} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
					onPress={() => Repository.setPage(1)}
					tooltip="First Page"
				/>);
	items.push(<IconButton
					key="prev"
					{...iconButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AngleLeft} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
					onPress={() => Repository.prevPage()}
					tooltip="Previous Page"
				/>);
	items.push(<Row
					key="pageSelector"
					mx={3}
					justifyContent="center"
					alignItems="center"
				>
					<Text mr={2}>Page</Text>
					<Input
						value={page}
						onChangeValue={(value) => Repository.setPage(value)}
						maxValue={totalPages}
						isDisabled={totalPages === 1}
						w={10}
						tooltip="Set Page"
					/>
					<Text ml={2}>of {totalPages}</Text>
				</Row>);

	isDisabled = page === totalPages || totalPages <= 1;
	items.push(<IconButton
					key="next"
					{...iconButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AngleRight} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
					onPress={() => Repository.nextPage()}
					tooltip="Next Page"
				/>);
	items.push(<IconButton
					key="last"
					{...iconButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AnglesRight} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
					onPress={() => Repository.setPage(totalPages)}
					tooltip="Last Page"
				/>);
	if (!Repository.isLocal) {
		items.push(<IconButton
						key="reload"
						{...iconButtonProps}
						icon={<Icon as={Rotate} {...iconProps} color="trueGray.600" />}
						onPress={() => Repository.reload()}
						tooltip="Reload"
					/>);
	}

	items.push(<Row
					key="pageSize"
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
					/>
				</Row>);

	let pageSpan = `${pageStart} – ${pageEnd}`;
	if (pageStart === pageEnd) {
		pageSpan = pageStart;
	}
	
	return <Row
				justifyContent="flex-start"
				alignItems="center"
				px={2}
				style={{ userSelect: 'none', }}
				{...props}
			>
				{items}
				<Text ml={3}>Displaying {pageSpan} of {total}</Text>
			</Row>;
};
