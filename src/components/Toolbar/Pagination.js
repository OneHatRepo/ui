import { useEffect, useMemo, } from 'react';
import {
	Button,
	ButtonText,
	HStack,
	Icon,
	Text,
} from '@gluestack-ui/themed';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import testProps from '../../Functions/testProps.js';
import Button from '../Buttons/Button.js';
import IconButton from '../Buttons/IconButton.js';
import ReloadPageButton from '../Buttons/ReloadPageButton.js';
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
			if (showPagination) {
				items.push(<Button
								{...testProps('showMoreBtn')}
								key="showMoreBtn"
								reference="showMoreBtn"
								parent={self}
								onPress={() => Repository.showMore()}
								isDisabled={isDisabled}
								tooltip="Show More"
							>
								<ButtonText>Show More</ButtonText>
							</Button>);
			}
			if (!Repository.isLocal) {
				items.push(<ReloadPageButton key="reloadPageBtn" {...iconButtonProps} iconProps={iconProps} Repository={Repository} self={self} />);
			}
		} else {
			isDisabled = page === 1;
			if (showPagination) {
				items.push(<IconButton
								{...testProps('firstPageBtn')}
								key="firstPageBtn"
								reference="firstPageBtn"
								parent={self}
								{...iconButtonProps}
								isDisabled={isDisabled}
								icon={<Icon as={AnglesLeft} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
								onPress={() => Repository.setPage(1)}
								tooltip="First Page"
							/>);
				items.push(<IconButton
								{...testProps('prevPageBtn')}
								key="prevPageBtn"
								reference="prevPageBtn"
								parent={self}
								{...iconButtonProps}
								isDisabled={isDisabled}
								icon={<Icon as={AngleLeft} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
								onPress={() => Repository.prevPage()}
								tooltip="Previous Page"
							/>);
				if (!minimize) {
					items.push(<HStack
									key="pageSelector"
									mx={3}
									justifyContent="center"
									alignItems="center"
								>
									<Text mr={2}>Page</Text>
									<Input
										{...testProps('pageInput')}
										reference="pageInput"
										parent={self}
										keyboardType="numeric"
										value={page?.toString()}
										onChangeValue={(value) => Repository.setPage(value)}
										maxValue={totalPages}
										isDisabled={totalPages === 1}
										w={10}
										tooltip="Set Page"
									/>
									<Text ml={2}>of {totalPages}</Text>
								</HStack>);
				}

				isDisabled = page === totalPages || totalPages <= 1;
				items.push(<IconButton
								{...testProps('nextPageBtn')}
								key="nextPageBtn"
								reference="nextPageBtn"
								parent={self}
								{...iconButtonProps}
								isDisabled={isDisabled}
								icon={<Icon as={AngleRight} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
								onPress={() => Repository.nextPage()}
								tooltip="Next Page"
							/>);
				items.push(<IconButton
								{...testProps('lastPageBtn')}
								key="lastPageBtn"
								reference="lastPageBtn"
								parent={self}
								{...iconButtonProps}
								isDisabled={isDisabled}
								icon={<Icon as={AnglesRight} {...iconProps} color={isDisabled ? 'disabled' : 'trueGray.600'} />}
								onPress={() => Repository.setPage(totalPages)}
								tooltip="Last Page"
							/>);
			}

			if (!Repository.isLocal) {
				items.push(<ReloadPageButton key="reloadPageBtn" {...iconButtonProps} iconProps={iconProps} Repository={Repository} self={self} />);
			}
			if (showPagination && !minimize && !disablePageSize) {
				items.push(<PageSizeCombo
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
				items.push(<Text key="pageDisplay" ml={3}>Displaying {pageSpan} of {total}</Text>);
			}
		}
		
		return <HStack
					justifyContent="flex-start"
					alignItems="center"
					px={2}
					style={{ userSelect: 'none', }}
					{...props}
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
	])
};
