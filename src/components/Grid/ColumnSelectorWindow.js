import { useRef, } from 'react';
import {
	ButtonText,
} from '@gluestack-ui/themed';
import Button from '../Buttons/Button.js';
import CheckboxButton from '../Buttons/CheckboxButton.js';
import Grid from './Grid.js';
import Panel from '../Panel/Panel.js';
import Toolbar from '../Toolbar/Toolbar.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import _ from 'lodash';

// helper for Grid

export default function ColumnSelectorWindow(props) {
	const
		{
			onClose,
			columnsConfig,
			setColumnsConfig,
		} = props,
		forceUpdate = useForceUpdate(),
		localColumnsConfig = useRef(columnsConfig),
		[width, height] = useAdjustedWindowSize(300, 500),
		onSave = () => {
			const newColumnsConfig = _.cloneDeep(localColumnsConfig.current);
			setColumnsConfig(newColumnsConfig);
			onClose();
		},
		onShowColumn = (ix) => {
			const newColumnsConfig = _.cloneDeep(localColumnsConfig.current);
			newColumnsConfig[ix].isHidden = false;
			localColumnsConfig.current = newColumnsConfig;
			forceUpdate();
		},
		onHideColumn = (ix) => {
			const newColumnsConfig = _.cloneDeep(localColumnsConfig.current);
			newColumnsConfig[ix].isHidden = true;
			localColumnsConfig.current = newColumnsConfig;
			forceUpdate();
		},
		columnData = _.map(localColumnsConfig.current, (config, ix) => {
			const {
				fieldName,
				header = _.upperFirst(fieldName),
			} = config;
			return [
				ix,
				header,
			];
		});
	return <Panel
				{...props}
				title="Column Selector"
				reference="columnSelectorWindow"
				isCollapsible={false}
				bg="#fff"
				w={width}
				h={height}
				flex={null}
			>
				<Grid
					showHeaders={false}
					showHovers={false}
					shadow={1}
					autoAdjustPageSizeToHeight={false}
					disableWithSelection={true}
					data={columnData}
					flex={1}
					alternateRowBackgrounds={false}
					columnsConfig={[
						{
							header: 'Show',
							fieldName: 'is_shown',
							isSortable: false,
							isEditable: false,
							isReorderable: false,
							isResizable: false,
							w: '50px',
							renderer: (datum) => {
								const
									[ix, header] = datum,
									columnConfig = localColumnsConfig.current[ix],
									isHidden = columnConfig.isHidden,
									isHidable = columnConfig.isHidable;
								return <CheckboxButton
											isChecked={!isHidden}
											isDisabled={!isHidable}
											onPress={() => {
												if (isHidden) {
													onShowColumn(ix);
												} else {
													onHideColumn(ix);
												}
											}}
										/>;
							}
						},
						{
							header: 'Column',
							fieldName: 1, // ix
							isSortable: false,
							isEditable: false,
							isReorderable: false,
							isResizable: false,
							flex: 3,
						}
					]}
				/>
				<Toolbar 
				justifyContent="flex-end">
					<Button
						key="cancelBtn"
						variant="ghost"
						onPress={onClose}
						color="#fff"
						mr={2}
					>
						<ButtonText>Cancel</ButtonText>
					</Button>
					<Button
						key="saveBtn"
						onPress={onSave}
						color="#fff"
					>
						<ButtonText>Save</ButtonText>
					</Button>
				</Toolbar>
			</Panel>;
}

