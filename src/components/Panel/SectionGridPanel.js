import { useState, useEffect, } from 'react';
import {
	Column,
	Pressable,
	Row,
	SectionList,
	Text,
} from 'native-base';
import testProps from '../functions/testProps';
import useForceUpdate from '../hooks/useForceUpdate';
import Footer from './Footer';
import Toolbar from './Toolbar/Toolbar';
import PaginationToolbar from './Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import AngleRight from './Icons/AngleRight';
import _ from 'lodash';

export default function SectionGridPanel(props) {
	
	// const {
	// 		Repository = null,
	// 		data = [],
	// 		topToolbar = null,
	// 		bottomToolbar = 'pagination',
	// 		columns = [],
	// 		columnProps = {},
	// 		getRowProps = () => {
	// 			return {
	// 				bg: '#fff',
	// 				p: 2,
	// 			};
	// 		},
	// 		renderSectionHeader = () => {},
	// 		onSelect = () => {},
	// 		initialScrollIndex = 0,
	// 		initialNumToRender = data.length,
	// 		sectionListProps = {},
	// 		pullToRefresh = true,
	// 		disableLoadingIndicator = false,
	// 		hideRightColumn = false,
	// 		noneFoundText,
	// 	} = props,
	// 	[isLoading, setIsLoading] = useState(false),
	// 	forceUpdate = useForceUpdate(),
		
	// 	columnRenderer = (entity) => {
	// 		let c = columns;
	// 		if (_.isFunction(c)) {
	// 			c = c(entity);
	// 		}
	// 		if (_.isArray(c)) {
	// 			return _.map(c, (config, key) => {
	// 				let value;

	// 				if (_.isObject(config)) {
	// 					if (config.renderer) {
	// 						return config.renderer(entity, key);
	// 					}
	// 				}
	// 				if (_.isString(config)) {
	// 					value = entity[config];
	// 				}
	// 				if (_.isFunction(config)) {
	// 					value = config(entity);
	// 				}
					
	// 				if (_.isFunction(value)) {
	// 					return value(key);
	// 				}

	// 				const propsToPass = columnProps[key] || {};
	// 				return <Text key={key} flex={1} {...propsToPass}>{value}</Text>;
	// 			});
	// 		} else {
	// 			throw new Error('Non-array or function columns not yet supported');
	// 		}
	// 	};
	
	// useEffect(() => {
	// 	if (!Repository || !Repository.on) {
	// 		return;
	// 	}
	// 	if (disableLoadingIndicator) {
	// 		return;
	// 	}
	// 	const setTrue = () => setIsLoading(true),
	// 		setFalse = () => setIsLoading(false);

	// 	Repository.on('beforeLoad', setTrue);
	// 	Repository.on('load', setFalse);
	// 	Repository.on('change', forceUpdate);
		
	// 	return () => {
	// 		Repository.off('beforeLoad', setTrue);
	// 		Repository.off('load', setFalse);
	// 		Repository.off('change', forceUpdate);
	// 	};
	// }, [Repository, disableLoadingIndicator, forceUpdate]);
	
	// return <Column
	// 			{...testProps('GridPanelContainer')}
	// 			flex={1}
	// 			w="100%"
	// 		>
	// 			{topToolbar && <Toolbar>{topToolbar}</Toolbar>}
				
	// 			{(!data.length) ? <NoRecordsFound text={noneFoundText} /> : 
	// 				<SectionList
	// 					refreshing={isLoading}
	// 					onRefresh={pullToRefresh ? () => { Repository.load() } : null}
	// 					sections={data}
	// 					keyExtractor={(item, index) => item + index}
	// 					renderSectionHeader={renderSectionHeader}
	// 					initialScrollIndex={initialScrollIndex}
	// 					initialNumToRender={initialNumToRender}
	// 					renderItem={(row) => {
	// 						const entity = row.item,
	// 							rowProps = getRowProps ? getRowProps(entity) : {};
							
	// 						return <Pressable
	// 									{...testProps('SectionList-' + entity.id)}
	// 									onPress={() => onSelect(entity)}
	// 									onLongPress={() => onSelect(entity)}
	// 								>
	// 									<Row
	// 										alignItems="center"
	// 										borderBottomWidth={1}
	// 										borderBottomColor="trueGray.500"
	// 										{...rowProps}
	// 										>
	// 											{columnRenderer(entity)}
	// 											{!hideRightColumn && <AngleRight
	// 												color="#aaa"
	// 												variant="ghost"
	// 												w={30}
	// 												alignSelf="center"
	// 												ml={3}
	// 											/>}
	// 									</Row>
	// 								</Pressable>;
	// 					}}
	// 					bg="trueGray.200"
	// 					{...sectionListProps}
	// 				/>}

	// 			{bottomToolbar && (bottomToolbar !== 'pagination' || Repository.entities.length > 5) && /* Only show pagination toolbar if >5 items to display */ (
	// 				<Footer>
	// 					{(
	// 						bottomToolbar === 'pagination' ? 
	// 							<PaginationToolbar Repository={Repository} /> :
	// 								<Toolbar>{bottomToolbar}</Toolbar>
	// 					)}
	// 				</Footer>
	// 			)}
	// 		</Column>;
}
