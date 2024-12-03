import { useEffect, useMemo, } from 'react';
import {
	HStack,
	HStackNative,
	Text,
} from '../Gluestack';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import testProps from '../../Functions/testProps.js';
import Button from '../Buttons/Button.js';
import IconButton from '../Buttons/IconButton.js';
import ReloadButton from '../Buttons/ReloadButton.js';
import AngleLeft from '../Icons/AngleLeft.js';
import AnglesLeft from '../Icons/AnglesLeft.js';
import AngleRight from '../Icons/AngleRight.js';
import AnglesRight from '../Icons/AnglesRight.js';
import Input from '../Form/Field/Input.js';
import PageSizeSelect from '../Form/Field/Select/PageSizeSelect.js';

export default function Pagination(props) {
	const {
			minimize = false,
			disablePageSize = false,
			showMoreOnly = false,
			showPagination = true, // everything except reloadBtn

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
			iconProps = {
				size: 'sm',
			};

		let items = [],
			isDisabled = false;
		if (showMoreOnly) {
			isDisabled = (pageEnd === total);
			if (showPagination) {
				items.push(<Button
								{...testProps('showMoreBtn')}
								key="showMoreBtn"
								reference="showMoreBtn"
								parent={self}
								onPress={() => Repository.showMore()}
								isDisabled={isDisabled}
								text="Show More"
							/>);
			}
			if (!Repository.isLocal) {
				items.push(<ReloadButton
					key="reloadPageBtn"
					_icon={iconProps}
					Repository={Repository}
					self={self}
				/>);
			}
		} else {
			isDisabled = page === 1;
			if (showPagination) {
				items.push(<IconButton
								{...testProps('firstPageBtn')}
								key="firstPageBtn"
								reference="firstPageBtn"
								parent={self}
								isDisabled={isDisabled}
								icon={AnglesLeft}
								_icon={iconProps}
								onPress={() => Repository.setPage(1)}
								tooltip="First Page"
							/>);
				items.push(<IconButton
								{...testProps('prevPageBtn')}
								key="prevPageBtn"
								reference="prevPageBtn"
								parent={self}
								isDisabled={isDisabled}
								icon={AngleLeft}
								_icon={iconProps}
								onPress={() => Repository.prevPage()}
								tooltip="Previous Page"
							/>);
				if (!minimize) {
					items.push(<HStack
									key="pageSelector"
									className={`
										pageSelector
										w-[100px]
										mx-2
										justify-center
										items-center
										bg-[#f00]
									`}>
									{/* <Text className="page mr-1">Page</Text>
									<Input
										{...testProps('pageInput')}
										reference="pageInput"
										parent={self}
										keyboardType="numeric"
										value={page?.toString()}
										onChangeValue={(value) => Repository.setPage(value)}
										maxValue={totalPages}
										isDisabled={totalPages === 1}
										className="pageInput w-[30px] text-center bg-grey-100"
										tooltip="Set Page"
									/>
									<Text className="of ml-1">of {totalPages}</Text> */}
								</HStack>);
				}

				isDisabled = page === totalPages || totalPages <= 1;
				items.push(<IconButton
								{...testProps('nextPageBtn')}
								key="nextPageBtn"
								reference="nextPageBtn"
								parent={self}
								isDisabled={isDisabled}
								icon={AngleRight}
								_icon={iconProps}
								onPress={() => Repository.nextPage()}
								tooltip="Next Page"
							/>);
				items.push(<IconButton
								{...testProps('lastPageBtn')}
								key="lastPageBtn"
								reference="lastPageBtn"
								parent={self}
								isDisabled={isDisabled}
								icon={AnglesRight}
								_icon={iconProps}
								onPress={() => Repository.setPage(totalPages)}
								tooltip="Last Page"
							/>);
			}

			if (!Repository.isLocal) {
				items.push(<ReloadButton
					key="reloadPageBtn"
					_icon={iconProps}
					Repository={Repository}
					self={self}
				/>);
			}
			if (showPagination && !minimize && !disablePageSize) {
				items.push(<PageSizeSelect
								{...testProps('pageSize')}
								key="pageSize"
								reference="pageSize"
								parent={self}
								pageSize={pageSize}
								Repository={Repository}
							/>);
			}
			if (showPagination && !minimize) {
				let pageSpan = `${pageStart} – ${pageEnd}`;
				if (pageStart === pageEnd) {
					pageSpan = pageStart;
				}
				items.push(<Text
								key="pageDisplay"
								className="pageDisplay ml-3 min-w-[200px]"
							>Displaying {pageSpan} of {total}</Text>);
			}
		}
		return <HStack
					style={{ userSelect: 'none', }}
					className="Pagination justify-start items-center px-2 "
				>
					{items}
				</HStack>;
	}, [
		Repository?.hash,
		showPagination,
		page,
		pageSize,
		total,
		totalPages,
		pageStart,
		pageEnd,
		minimize,
	]);
}
