import { useEffect, useMemo, } from 'react';
import {
	HStack,
	HStackNative,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
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
			if (totalPages > 1 && showPagination) {
				isDisabled = (pageEnd === total);
				items.push(<Button
								{...testProps('showMoreBtn')}
								key="showMoreBtn"
								reference="showMoreBtn"
								className="Pagination-showMoreBtn"
								parent={self}
								onPress={() => Repository.showMore()}
								isDisabled={isDisabled}
								text="Show More"
							/>);
			}
			if (!Repository.isLocal) {
				items.push(<ReloadButton
								key="reloadPageBtn"
								className="Pagination-reloadPageBtn"
								_icon={iconProps}
								Repository={Repository}
								self={self}
							/>);
			}
		} else {
			if (!Repository.isLocal) {
				items.push(<ReloadButton
								key="reloadPageBtn"
								className="Pagination-reloadPageBtn"
								_icon={iconProps}
								Repository={Repository}
								self={self}
							/>);
			}
			if (totalPages > 1) {
				isDisabled = page === 1;
				if (showPagination) {
					items.push(<IconButton
									{...testProps('firstPageBtn')}
									key="firstPageBtn"
									reference="firstPageBtn"
									className="Pagination-firstPageBtn"
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
									className="Pagination-prevPageBtn"
									parent={self}
									isDisabled={isDisabled}
									icon={AngleLeft}
									_icon={iconProps}
									onPress={() => Repository.prevPage()}
									tooltip="Previous Page"
								/>);

					isDisabled = page === totalPages || totalPages <= 1;
					items.push(<IconButton
									{...testProps('nextPageBtn')}
									key="nextPageBtn"
									reference="nextPageBtn"
									className="Pagination-nextPageBtn"
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
									className="Pagination-lastPageBtn"
									parent={self}
									isDisabled={isDisabled}
									icon={AnglesRight}
									_icon={iconProps}
									onPress={() => Repository.setPage(totalPages)}
									tooltip="Last Page"
								/>);
					if (!minimize) {
						items.push(<Text
										key="page"
										className="Pagination-page mx-1"
									>Page</Text>);
						items.push(<Input
										{...testProps('pageInput')}
										key="pageInput"
										reference="pageInput"
										parent={self}
										keyboardType="numeric"
										value={page?.toString()}
										onChangeValue={(value) => Repository.setPage(value)}
										maxValue={totalPages}
										isDisabled={totalPages === 1}
										className={clsx(
											'Pagination-pageInput',
											'min-w-[40px]',
											'w-[40px]',
											'text-center',
											'bg-grey-100',
										)}
										textAlignIsCenter={true}
										tooltip="Set Page"
										tooltipClassName="w-[40px]"
									/>);
						items.push(<Text
										key="totalPages"
										className={clsx(
											'Pagination-totalPages',
											'whitespace-nowrap',
											'inline-flex',
											'mx-1',
										)}
									>{`of ${totalPages}`}</Text>);
					}
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
									className={clsx(
										'Pagination-pageDisplay',
										'whitespace-nowrap',
										'inline-flex',
										'mx-1',
									)}
								>{`Displaying ${pageSpan} of ${total}`}</Text>);
				}
			}
		}
		return <HStack
					style={{
						userSelect: 'none',
					}}
					className={clsx(
						'Pagination',
						'items-center',
						'shrink-0',
						'gap-1',
					)}
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
