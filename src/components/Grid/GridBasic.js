import { useState, useEffect, } from 'react';
import {
	Column,
	FlatList,
	Pressable,
	Row,
	Text,
} from 'native-base';
import testProps from '../../functions/testProps';
import useForceUpdate from '../../hooks/useForceUpdate';
import Loading from '../Messages/Loading';
import Footer from '../Footer';
import Toolbar from '../Toolbar/Toolbar';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import AngleRight from '../Icons/AngleRight';
import _ from 'lodash';

// This is a grid that does NOT make use of @sencha/sencha-grid;
// but simply uses stock NativeBase components

export default function GridBasic(props) {
	const {
			Repository,
			topToolbar = null,
			bottomToolbar = 'pagination',
			columns = [],
			columnProps = {},
			getRowProps = () => {
				return {
					bg: '#fff',
					p: 2,
				};
			},
			onSelect = () => {},
			initialScrollIndex = 0,
			flatListProps = {},
			pullToRefresh = true,
			hideRightColumn = false,
			disableLoadingIndicator = false,
			noneFoundText,
			disableReloadOnChangeFilters = false,
		} = props,
		entities = Repository.entities,
		[isLoading, setIsLoading] = useState(false),
		forceUpdate = useForceUpdate(),
		onRefresh = () => Repository.load(),
		
		columnRenderer = (entity) => {
			if (_.isArray(columns)) {
				return _.map(columns, (config, key) => {
					let value;

					if (_.isObject(config)) {
						if (config.renderer) {
							return config.renderer(entity, key);
						}
					}
					if (_.isString(config)) {
						value = entity[config];
					}
					if (_.isFunction(config)) {
						value = config(entity);
					}
					
					if (_.isFunction(value)) {
						return value(key);
					}

					const propsToPass = columnProps[key] || {};
					return <Text key={key} flex={1} {...propsToPass}>{value}</Text>;
				});
			} else {
				// TODO: if 'columns' is an object, parse its contents
				throw new Error('Non-array columns not yet supported');
			}
		};
	
	useEffect(() => {
		if (!Repository || !Repository.on) {
			return;
		}
		if (disableLoadingIndicator) {
			return;
		}
		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			onChangeFilters = () => {
				if (!Repository.autoLoad && Repository.isLoaded && !disableReloadOnChangeFilters) {
					Repository.reload();
				}
			};

		Repository.on('beforeLoad', setTrue);
		Repository.on('load', setFalse);
		Repository.on('change', forceUpdate);
		Repository.on('changeFilters', onChangeFilters);
		
		return () => {
			Repository.off('beforeLoad', setTrue);
			Repository.off('load', setFalse);
			Repository.off('change', forceUpdate);
			Repository.off('changeFilters', onChangeFilters);
		};
	}, [Repository, disableLoadingIndicator, disableReloadOnChangeFilters, forceUpdate]);
	
	if (!props.Repository) {
		return null;
	}
	return <Column
				{...testProps('GridPanelContainer')}
				flex={1}
				w="100%"
			>
				{topToolbar && <Toolbar>{topToolbar}</Toolbar>}
				
				{isLoading && <Column flex={1}><Loading /></Column>}

				{!isLoading && (!entities.length ? <NoRecordsFound text={noneFoundText} onRefresh={onRefresh} /> : 
					<FlatList
						refreshing={isLoading}
						onRefresh={pullToRefresh ? onRefresh : null}
						progressViewOffset={100}
						data={entities}
						keyExtractor={(entity) => {
							return String(entity.id);
						}}
						initialScrollIndex={initialScrollIndex}
						initialNumToRender={entities.length}
						renderItem={(row) => {
							const entity = row.item,
								rowProps = getRowProps ? getRowProps(entity) : {};
							return <Pressable
										{...testProps(Repository.schema.name + '-' + entity.id)}
										onPress={() => onSelect(entity)}
										onLongPress={() => onSelect(entity)}
									>
										<Row
											alignItems="center"
											borderBottomWidth={1}
											borderBottomColor="trueGray.500"
											{...rowProps}
											>
												{columnRenderer(entity)}
												{!hideRightColumn && <AngleRight
													color="#aaa"
													variant="ghost"
													w={30}
													alignSelf="center"
													ml={3}
												/>}
										</Row>
									</Pressable>;
						}}
						bg="trueGray.200"
						{...flatListProps}
					/>)}

				{bottomToolbar && (bottomToolbar !== 'pagination' || Repository.total > 5) &&
					<Footer pt={0} pb={0} px={0}>
						{bottomToolbar === 'pagination' ? 
							<PaginationToolbar Repository={Repository} /> :
								<Toolbar>{bottomToolbar}</Toolbar>
							}
					</Footer>}
			</Column>;
}
