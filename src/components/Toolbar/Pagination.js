import { useEffect, } from 'react';
import {
	Icon,
	IconButton,
	Row,
	Text,
} from 'native-base';
import useForceUpdate from '../../hooks/useForceUpdate';
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
			pageTotal,
		} = Repository,
		paginationButtonProps = {
			h: '20px',
			w: '20px',
			mx: 1,
		},
		iconProps = {
			position: 'absolute',
			textAlign: 'center',
			size: 'sm',
			color: 'trueGray.500',
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
					{...paginationButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AnglesLeft} {...iconProps} color={isDisabled ? 'trueGray.500' : 'trueGray.600'} />}
					onPress={() => Repository.setPage(1)}
				/>);
	items.push(<IconButton
					key="prev"
					{...paginationButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AngleLeft} {...iconProps} color={isDisabled ? 'trueGray.500' : 'trueGray.600'} />}
					onPress={() => Repository.prevPage()}
				/>);

	isDisabled = page === totalPages || !totalPages;
	items.push(<IconButton
					key="next"
					{...paginationButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AngleRight} {...iconProps} color={isDisabled ? 'trueGray.500' : 'trueGray.600'} />}
					onPress={() => Repository.nextPage()}
				/>);
	items.push(<IconButton
					key="last"
					{...paginationButtonProps}
					isDisabled={isDisabled}
					icon={<Icon as={AnglesRight} {...iconProps} color={isDisabled ? 'trueGray.500' : 'trueGray.600'} />}
					onPress={() => Repository.setPage(totalPages)}
				/>);
	items.push(<IconButton
					key="reload"
					{...paginationButtonProps}
					icon={<Icon as={Rotate} {...iconProps} color={isDisabled ? 'trueGray.500' : 'trueGray.600'} />}
					onPress={() => Repository.reload()}
				/>);

	// Pagesize Picker
	items.push(<Picker
					_select={{
						key: 'pageSize',
						placeholder: 'Page Size',
						selectedValue: pageSize,
						onValueChange: (value) => Repository.setPageSize(value),
						fontSize: 14,
						bg: 'trueGray.200',
						ml: 1,
						h: 7,
					}}
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
				w="100%"
				px={2}
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
