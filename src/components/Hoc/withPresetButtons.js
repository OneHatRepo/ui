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
	'view',
	'copy',
	'duplicate',
	// 'print',
];

export default function withPresetButtons(WrappedComponent, isGrid = false) {
	return (props) => {

		if (props.disablePresetButtons) {
			// bypass everything
			return <WrappedComponent {...props} />;
		}

		const {
				// extract and pass
				contextMenuItems = [],
				additionalToolbarButtons = [],
				onChangeColumnsConfig,
				verifyCanEdit,
				verifyCanDelete,
				verifyCanDuplicate,
				...propsToPass
			} = props,
			{
				// for local use
				isEditor = false,
				isTree = false,
				isSideEditor = false,
				canEditorViewOnly = false,
				disableAdd = !isEditor,
				disableEdit = !isEditor,
				disableDelete = !isEditor,
				disableView = !isGrid,
				disableCopy = !isGrid,
				disableDuplicate = !isEditor,
				disablePrint = !isGrid,

				// withAlert
				showInfo,

				// withComponent
				self,

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

				// parent container
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
						if (disableAdd || canEditorViewOnly) {
							isDisabled = true;
						}
						break;
					case 'edit':
						if (disableEdit || canEditorViewOnly || isSideEditor) {
							isDisabled = true;
						}
						break;
					case 'delete':
						if (disableDelete || canEditorViewOnly) {
							isDisabled = true;
						}
						break;
					case 'view':
						if (disableView || isSideEditor) {
							isDisabled = true;
						}
						break;
					case 'copy':
						if (disableCopy) {
							isDisabled = true;
						}
						break;
					case 'duplicate':
						if (disableDuplicate || canEditorViewOnly) {
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
				let key,
					text,
					handler,
					icon = null,
					isDisabled = false;
				switch(type) {
					case 'add':
						key = 'addBtn';
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
						key = 'editBtn';
						text = 'Edit';
						handler = onEdit;
						icon = <Edit />;
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (_.isEmpty(selection) || (_.isArray(selection) && selection.length > 1)) {
							isDisabled = true;
						}
						if (verifyCanEdit && !verifyCanEdit(selection)) {
							isDisabled = true;
						}
						break;
					case 'delete':
						key = 'deleteBtn';
						text = 'Delete';
						handler = onDelete;
						icon = <Trash />;
						if (selectorId && !selectorSelected) {
							isDisabled = true;
						}
						if (_.isEmpty(selection) || (_.isArray(selection) && selection.length > 1)) {
							isDisabled = true;
						}
						if (verifyCanDelete && !verifyCanDelete(selection)) {
							isDisabled = true;
						}
						break;
					case 'view':
						key = 'viewBtn';
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
						key = 'copyBtn';
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
						key = 'duplicateBtn';
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
						if (verifyCanDuplicate && !verifyCanDuplicate(selection)) {
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
					key,
					text,
					handler,
					icon,
					isDisabled,
					parent: self,
					reference: key,
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
				navigator?.clipboard.writeText(text);
				if (showInfo) {
					showInfo('Copied to clipboard!');
				}
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

		return <WrappedComponent
					{...propsToPass}
					disablePresetButtons={false}
					contextMenuItems={[
						...contextMenuItems,
						...localContextMenuItems,
					]}
					additionalToolbarButtons={[
						...additionalToolbarButtons,
						...localAdditionalToolbarButtons,
					]}
					onChangeColumnsConfig={onChangeColumnsConfigDecorator}
				/>;
	};
}