import React, { useState, useEffect, } from 'react';
import Clipboard from '../Components/Icons/Clipboard';
import Duplicate from '../Components/Icons/Duplicate';
import Edit from '../Components/Icons/Edit';
import Eye from '../Components/Icons/Eye';
import Trash from '../Components/Icons/Trash';
import Plus from '../Components/Icons/Plus';
import Print from '../Components/Icons/Print';
import _ from 'lodash';

// Note: A 'present button' will create both a context menu item 
// and a toolbar button that match in text label, icon, and handler.

export default function withPresetButtons(WrappedComponent) {
	return (props) => {
		const {
				// extract and pass
				presetButtons = [
					'add',
					'edit',
					'delete',
					'copy',
					// 'view',
					'duplicate',
					'print',
				],
				contextMenuItems = [],
				additionalToolbarButtons = [],
				...propsToPass
			} = props,
			{
				// for local use
				setIsContextMenuShown,
				selection,
				setSelection, // in case it's ever needed!
				onAdd,
				onEdit,
				onRemove,
				onView,
				onDuplicate,

				
				rowsData,
			} = props,
			[localContextMenuItems, setLocalContextMenuItems] = useState([]),
			[localAdditionalToolbarButtons, setLocalAdditionalToolbarButtons] = useState([]),
			getPresetButtonProps = (type) => {
				let text,
					handler,
					icon = null,
					isDisabled = false;
				switch(type) {
					case 'add':
						text = 'Add';
						handler = onAdd;
						icon = <Plus />;
						break;
					case 'edit':
						text = 'Edit';
						handler = onEdit;
						icon = <Edit />;
						isDisabled = !selection.length || selection.length !== 1;
						break;
					case 'delete':
						text = 'Delete';
						handler = onRemove;
						icon = <Trash />;
						isDisabled = !selection.length || selection.length !== 1;
						break;
					case 'view':
						text = 'View';
						handler = onView;
						icon = <Eye />;
						isDisabled = !selection.length || selection.length !== 1;
						break;
					case 'copy':
						text = 'Copy';
						handler = onCopyToClipboard;
						icon = <Clipboard />;
						isDisabled = !selection.length;
						break;
					case 'duplicate':
						text = 'Duplicate';
						handler = onDuplicate;
						icon = <Duplicate />;
						isDisabled = !selection.length || selection.length !== 1;
						break;
					case 'print':
						text = 'Print';
						handler = onPrint;
						icon = <Print />;
						break;
					default:
				}
				return {
					text,
					handler,
					icon,
					isDisabled,
				};
			},
			onCopyToClipboard = () => {
				// Get text of all selected rows
				const selectedRows = _.filter(rowsData, (rowData) => {
					if (!rowData.entity || !rowData.isSelected) {
						return false;
					}
					return rowData;
				});
				let text;
				if (selectedRows.length) {
					const
						headerText = _.map(rowsData[0].cellsData, (cellData) => cellData.header).join("\t"),
						rowTexts = _.map(selectedRows, (rowData) => {
							const {
									entity,
									cellsData,
								} = rowData,
								rowValues = _.map(cellsData, (cellData) => {
											if (!cellData.columnConfig) {
												return null;
											}
											const fieldName = cellData.columnConfig.fieldName;
											return entity[fieldName];
										});
								return rowValues.join("\t");
						});
					text = [headerText, ...rowTexts].join("\n");
				} else {
					text = 'Nothing selected to copy!';
				}
	
				// Send it to clipboard
				navigator.clipboard.writeText(text);
			},
			onPrint = () => {
				debugger;
			};

		useEffect(() => {
			const
				localContextMenuItems = [],
				localAdditionalToolbarButtons = [];
			
			_.each(presetButtons, (type) => {
				const config = getPresetButtonProps(type);

				localContextMenuItems.push(config);
				localAdditionalToolbarButtons.push(config);
			});

			setLocalContextMenuItems(localContextMenuItems);
			setLocalAdditionalToolbarButtons(localAdditionalToolbarButtons);
		}, [presetButtons]);
	

		return <WrappedComponent
					{...propsToPass}
					contextMenuItems={[...localContextMenuItems, ...contextMenuItems]}
					additionalToolbarButtons={[...localAdditionalToolbarButtons, ...additionalToolbarButtons]}
				/>;
	};
}