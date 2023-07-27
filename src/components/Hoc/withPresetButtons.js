import React, { useState, useEffect, } from 'react';
import Clipboard from '../Icons/Clipboard.js';
import Duplicate from '../Icons/Duplicate.js';
import Edit from '../Icons/Edit.js';
import Eye from '../Icons/Eye.js';
import Trash from '../Icons/Trash.js';
import Plus from '../Icons/Plus.js';
import Print from '../Icons/Print.js';
import inArray from '../../Functions/inArray.js';
import _ from 'lodash';

// Note: A 'present button' will create both a context menu item 
// and a toolbar button that match in text label, icon, and handler.

const presetButtons = [
	'add',
	'edit',
	'delete',
	'copy',
	'view',
	'duplicate',
	// 'print',
];

export default function withPresetButtons(WrappedComponent, isGrid = false) {
	return (props) => {
		const {
				// extract and pass
				contextMenuItems,
				additionalToolbarButtons,
				onChangeColumnsConfig,
				...propsToPass
			} = props,
			{
				// for local use
				isEditor = false,
				isTree = false,
				useEditor = true,
				disableAdd = !isEditor,
				disableEdit = !isEditor,
				disableDelete = !isEditor,
				disableView = !isGrid,
				disableCopy = !isGrid,
				disableDuplicate = !isGrid,
				disablePrint = !isGrid,

				// withEditor
				userCanEdit = true,
				userCanView = true,
				onAdd,
				onEdit,
				onDelete,
				onView,
				onDuplicate,

				// withSelection
				selection,
				setSelection,

				// DataMgt
				selectorId,
				selectorSelected,
			} = props,
			[isReady, setIsReady] = useState(false),
			[localContextMenuItems, setLocalContextMenuItems] = useState([]),
			[localAdditionalToolbarButtons, setLocalAdditionalToolbarButtons] = useState([]),
			[localColumnsConfig, setLocalColumnsConfig] = useState([]),
			onChangeColumnsConfigDecorator = (columnsConfig) => {
				setLocalColumnsConfig(columnsConfig);
				if (onChangeColumnsConfig) {
					onChangeColumnsConfig(columnsConfig);
				}
			},
			isTypeDisabledCompletely = (type) => {
				let isDisabled = false;
				switch(type) {
					case 'add':
						if (disableAdd || !useEditor) {
							isDisabled = true;
						}
						break;
					case 'edit':
						if (disableEdit || !useEditor) {
							isDisabled = true;
						}
						break;
					case 'delete':
						if (disableDelete || !useEditor) {
							isDisabled = true;
						}
						break;
					case 'view':
						if (disableView) {
							isDisabled = true;
						}
						break;
					case 'copy':
						if (disableCopy) {
							isDisabled = true;
						}
						break;
					case 'duplicate':
						if (disableDuplicate || !useEditor) {
							isDisabled = true;
						}
						break;
					case 'print':
						if (disablePrint) {
							isDisabled = true;
						}
						break;
					default:
				}
				return isDisabled;
			},
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
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (isTree && _.isEmpty(selection)) {
							isDisabled = true;
						}
						break;
					case 'edit':
						text = 'Edit';
						handler = onEdit;
						icon = <Edit />;
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (_.isEmpty(selection)) {
							isDisabled = true;
						}
						break;
					case 'delete':
						text = 'Delete';
						handler = onDelete;
						icon = <Trash />;
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (_.isEmpty(selection) || selection.length > 1) {
							isDisabled = true;
						}
						break;
					case 'view':
						text = 'View';
						handler = onView;
						icon = <Eye />;
						isDisabled = !selection.length || selection.length !== 1;
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (_.isEmpty(selection) || selection.length > 1) {
							isDisabled = true;
						}
						break;
					case 'copy':
						text = 'Copy to Clipboard';
						handler = onCopyToClipboard;
						icon = <Clipboard />;
						isDisabled = !selection.length;
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (_.isEmpty(selection)) {
							isDisabled = true;
						}
						break;
					case 'duplicate':
						text = 'Duplicate';
						handler = onDuplicate;
						icon = <Duplicate />;
						isDisabled = !selection.length || selection.length !== 1;
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (_.isEmpty(selection) || selection.length > 1) {
							isDisabled = true;
						}
						break;
					// case 'print':
					// 	text = 'Print';
					// 	handler = onPrint;
					// 	icon = <Print />;
					// 	break;
					default:
				}
				return {
					text,
					handler,
					icon,
					isDisabled,
				};
			},
			generatePresetButtons = () => {
				const
					localContextMenuItems = [],
					localAdditionalToolbarButtons = [];
				
				_.each(presetButtons, (type) => {
					if (isTypeDisabledCompletely(type)) { // i.e. not just temporarily disabled because of selection
						return;
					}
					if ((!userCanEdit && inArray(type, ['add', 'edit', 'delete', 'duplicate',])) ||
						(!userCanView && type === 'view')) {
						return;
					}
	
					const config = getPresetButtonProps(type);
	
					localContextMenuItems.push(config);
					localAdditionalToolbarButtons.push(config);
				});
	
				setLocalContextMenuItems(localContextMenuItems);
				setLocalAdditionalToolbarButtons(localAdditionalToolbarButtons);
			},
			onCopyToClipboard = () => {
				// Get text of all selected rows
				let text;
				if (selection.length) {
					const
						headerText = _.map(localColumnsConfig, (config) => config.header).join("\t"),
						rowTexts = _.map(selection, (entity) => {
							const values = [];
							_.each(localColumnsConfig, (config) => {
								values.push(entity[config.fieldName]);
							});
							return values.join("\t");
						});
					text = [headerText, ...rowTexts].join("\n");
				} else {
					text = 'Nothing selected to copy!';
				}
	
				// Send it to clipboard
				navigator.clipboard.writeText(text);
			};
			// onPrint = () => {
			// 	debugger;
			// };

		useEffect(() => {
			generatePresetButtons();
			if (!isReady) {
				setIsReady(true);
			}
		}, [selection, selectorSelected, localColumnsConfig]);

		if (!isReady) {
			return null;
		}
	
		const
			contextMenuItemsToPass = [
				...localContextMenuItems,
			],
			additionalToolbarButtonsToPass = [
				...localAdditionalToolbarButtons,
			];
		if (contextMenuItems) {
			contextMenuItemsToPass.concat(contextMenuItems);
		}
		if (additionalToolbarButtons) {
			additionalToolbarButtonsToPass.concat(additionalToolbarButtons);
		}

		return <WrappedComponent
					{...propsToPass}
					contextMenuItems={contextMenuItemsToPass}
					additionalToolbarButtons={additionalToolbarButtonsToPass}
					onChangeColumnsConfig={onChangeColumnsConfigDecorator}
				/>;
	};
}