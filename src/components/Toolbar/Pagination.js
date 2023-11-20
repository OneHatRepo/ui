import { useEffect, useMemo, } from 'react';
import {
	Icon,
	Row,
	Text,
} from 'native-base';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import Button from '../Buttons/Button.js';
import IconButton from '../Buttons/IconButton.js';
import AngleLeft from '../Icons/AngleLeft.js';
import AnglesLeft from '../Icons/AnglesLeft.js';
import AngleRight from '../Icons/AngleRight.js';
import AnglesRight from '../Icons/AnglesRight.js';
import Rotate from '../Icons/Rotate.js';
import Input from '../Form/Field/Input.js';
import PageSizeCombo from '../Form/Field/Combo/PageSizeCombo.js';

export default function Pagination(props) {
	const {
			minimize = false,
			disablePageSize = false,
			showMoreOnly = false,

			// withComponent
			self,
	
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
		forceUpdate = useForceUpdate();

	useEffect(() => {
		Repository.ons(['changePage', 'changePageSize', 'changeData', ], forceUpdate);
		return () => {
			Repository.offs(['changePage', 'changePageSize', 'changeData', ], forceUpdate);
		};
	}, [Repository]);

	return useMemo(() => {
		const
			iconButtonProps = {
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
		let items = [],
			isDisabled = false;
		if (showMoreOnly) {
			isDisabled = (pageEnd === total);
			items.push(<Button
							key="showMore"
							parent={self}
							reference="showMoreBtn"
							onPress={() => Repository.showMore()}
							isDisabled={isDisabled}
							tooltip="Show More"
						>Show More</Button>);
			if (!Repository.isLocal) {
				items.push(<IconButton
								key="reload"
								parent={self}
								reference="reloadPageBtn"
								{...iconButtonProps}
								icon={<Icon as={Rotate} {...iconProps} color="trueGray.600" />}
								onPress={() => Repository.reload()}
								tooltip="Reload"
								ml={2}
							/>);
			}
		} else {
			isDisabled = page === 1;
			items.push(<IconButton
							key="first"
							parent={self}
							reference="firstPageBtn"
							{...iconButtonProps}
							isDisabled={isDisabled}
							icon={<Icon as={AnglesLeft} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
							onPress={() => Repository.setPage(1)}
							tooltip="First Page"
						/>);
			items.push(<IconButton
							key="prev"
							parent={self}
							reference="prevPageBtn"
							{...iconButtonProps}
							isDisabled={isDisabled}
							icon={<Icon as={AngleLeft} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
							onPress={() => Repository.prevPage()}
							tooltip="Previous Page"
						/>);
			if (!minimize) {
				items.push(<Row
								key="pageSelector"
								mx={3}
								justifyContent="center"
								alignItems="center"
							>
								<Text mr={2}>Page</Text>
								<Input
									parent={self}
									reference="pageInput"
									keyboardType="numeric"
									value={page?.toString()}
									onChangeValue={(value) => Repository.setPage(value)}
									maxValue={totalPages}
									isDisabled={totalPages === 1}
									w={10}
									tooltip="Set Page"
								/>
								<Text ml={2}>of {totalPages}</Text>
							</Row>);
			}
	
			isDisabled = page === totalPages || totalPages <= 1;
			items.push(<IconButton
							key="next"
							parent={self}
							reference="nextPageBtn"
							{...iconButtonProps}
							isDisabled={isDisabled}
							icon={<Icon as={AngleRight} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
							onPress={() => Repository.nextPage()}
							tooltip="Next Page"
						/>);
			items.push(<IconButton
							key="last"
							parent={self}
							reference="lastPageBtn"
							{...iconButtonProps}
							isDisabled={isDisabled}
							icon={<Icon as={AnglesRight} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
							onPress={() => Repository.setPage(totalPages)}
							tooltip="Last Page"
						/>);
			if (!Repository.isLocal) {
				items.push(<IconButton
								key="reload"
								parent={self}
								reference="reloadPageBtn"
								{...iconButtonProps}
								icon={<Icon as={Rotate} {...iconProps} color="trueGray.600" />}
								onPress={() => Repository.reload()}
								tooltip="Reload"
							/>);
			}
			if (!minimize && !disablePageSize) {
				items.push(<PageSizeCombo key="pageSize" pageSize={pageSize} Repository={Repository} />);
			}
			if (!minimize) {
				let pageSpan = `${pageStart} – ${pageEnd}`;
				if (pageStart === pageEnd) {
					pageSpan = pageStart;
				}
				items.push(<Text key="pageDisplay" ml={3}>Displaying {pageSpan} of {total}</Text>);
			}
		}
		
		return <Row
					justifyContent="flex-start"
					alignItems="center"
					px={2}
					style={{ userSelect: 'none', }}
					{...props}
				>
					{items}
				</Row>;
	}, [
		// Repository,
		page,
		pageSize,
		total,
		totalPages,
		pageStart,
		pageEnd,
		minimize,
	])
};
