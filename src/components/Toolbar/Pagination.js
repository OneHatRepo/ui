import { useEffect, } from 'react';
import {
	Icon,
	Row,
	Text,
} from 'native-base';
import useForceUpdate from '../../hooks/useForceUpdate';
import IconButton from '../Buttons/IconButton';
import AngleLeft from '../Icons/AngleLeft';
import AnglesLeft from '../Icons/AnglesLeft';
import AngleRight from '../Icons/AngleRight';
import AnglesRight from '../Icons/AnglesRight';
import Rotate from '../Icons/Rotate';
import Picker from '../Picker/Picker';

export default function Pagination(props) {
	const {
			Repository
		} = props,
		forceUpdate = useForceUpdate(),
		{
			page,
			pageSize,
			total,
			totalPages,
			pageStart,
			pageEnd,
		} = Repository,
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
	}, [Repository, forceUpdate]);

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

	isDisabled = page === totalPages || !totalPages;
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

	// Pagesize Picker
	items.push(<Picker
					_select={{
						key: 'pageSize',
						selectedValue: pageSize,
						onValueChange: (value) => Repository.setPageSize(value),
						fontSize: 14,
						bg: 'trueGray.100',
						ml: 1,
						h: 7,
					}}
					tooltip="Page Size"
					w={120}
					allowNull={false}
					key="pageSize"
					entities={[
						// { id: 1, displayValue: '1/pg'},
						{ id: 5, displayValue: '5/pg'},
						{ id: 10, displayValue: '10/pg'},
						{ id: 20, displayValue: '20/pg'},
						{ id: 50, displayValue: '50/pg'},
						{ id: 100, displayValue: '100/pg'},
					]}
				/>);

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
				<Text>{pageSpan} of {total}</Text>
				<Row
					justifyContent="center"
					alignItems="center"
					px={3}
				>
					{items}
				</Row>
			</Row>;
};
