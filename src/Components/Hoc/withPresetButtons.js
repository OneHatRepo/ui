import { forwardRef, useState, useEffect, } from 'react';
import {
	ADD,
	EDIT,
	DELETE,
	VIEW,
	COPY,
	DUPLICATE,
	PRINT,
	UPLOAD_DOWNLOAD,
	DOWNLOAD,
} from '../../Constants/Commands.js';
import Clipboard from '../Icons/Clipboard.js';
import Duplicate from '../Icons/Duplicate.js';
import Edit from '../Icons/Edit.js';
import Eye from '../Icons/Eye.js';
import Trash from '../Icons/Trash.js';
import Plus from '../Icons/Plus.js';
import Print from '../Icons/Print.js';
import UploadDownload from '../Icons/UploadDownload.js';
import Download from '../Icons/Download.js';
import inArray from '../../Functions/inArray.js';
import UploadsDownloadsWindow from '../Window/UploadsDownloadsWindow.js';
import _ from 'lodash';

// Note: A 'present button' will create both a context menu item 
// and a toolbar button that match in text label, icon, and handler.

const presetButtons = [
	ADD,
	EDIT,
	DELETE,
	VIEW,
	COPY,
	DUPLICATE,
	// PRINT,
	UPLOAD_DOWNLOAD,
	DOWNLOAD,
];

export default function withPresetButtons(WrappedComponent, isGrid = false) {
	return forwardRef((props, ref) => {

		if (props.disablePresetButtons || props.alreadyHasWithPresetButtons) {
			// bypass everything
			return <WrappedComponent {...props} ref={ref} />;
		}

		const {
				// extract and pass
				contextMenuItems = [],
				additionalToolbarButtons = [],
				useUploadDownload = false,
				useDownload = false,
				uploadHeaders,
				uploadParams,
				onUpload,
				downloadHeaders,
				downloadParams,
				onChangeColumnsConfig,
				canRecordBeEdited,
				canRecordBeDeleted,
				canRecordBeDuplicated,
				...propsToPass
			} = props,
			{
				// for local use
				isEditor = false,
				isTree = false,
				canDeleteRootNode = false,
				isSideEditor = false,
				canEditorViewOnly = false,
				disableAdd = !isEditor,
				disableEdit = !isEditor,
				disableDelete = !isEditor,
				disableView = !isGrid,
				disableCopy = !isGrid,
				disableDuplicate = !isEditor,
				disablePrint = !isGrid,
				protectedValues, // records with these values cannot be edited or deleted
			
				// withAlert
				showInfo,

				// withModal
				showModal,
				hideModal,

				// withComponent
				self,

				// withData
				Repository,

				// withPermissions
				canUser,

				// withEditor
				userCanEdit = true, // not permissions, but capability
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
					case ADD:
						if (disableAdd || canEditorViewOnly) {
							isDisabled = true;
						} else if (canUser && !canUser(ADD)) { // check Permissions
							isDisabled = true;
						}
						break;
					case EDIT:
						if (disableEdit || canEditorViewOnly || isSideEditor) {
							isDisabled = true;
						} else if (canUser && !canUser(EDIT)) { // check Permissions
							isDisabled = true;
						}
						break;
					case DELETE:
						if (disableDelete || canEditorViewOnly) {
							isDisabled = true;
						} else if (canUser && !canUser(DELETE)) { // check Permissions
							isDisabled = true;
						}
						break;
					case VIEW:
						if (disableView || isSideEditor) {
							isDisabled = true;
						} else if (canUser && !canUser(VIEW)) { // check Permissions
							isDisabled = true;
						}
						break;
					case COPY:
						if (disableCopy) {
							isDisabled = true;
						} else if (canUser && !canUser(COPY)) { // check Permissions
							isDisabled = true;
						}
						break;
					case DUPLICATE:
						if (disableDuplicate || canEditorViewOnly) {
							isDisabled = true;
						} else if (canUser && !canUser(DUPLICATE)) { // check Permissions
							isDisabled = true;
						}
						break;
					case PRINT:
						if (disablePrint) {
							isDisabled = true;
						} else if (canUser && !canUser(PRINT)) { // check Permissions
							isDisabled = true;
						}
						break;
					case UPLOAD_DOWNLOAD:
						if (!useUploadDownload) {
							isDisabled = true;
						} else if (canUser && !canUser(UPLOAD_DOWNLOAD)) { // check Permissions
							isDisabled = true;
						}
						break;
					case DOWNLOAD:
						if (!useDownload) {
							isDisabled = true;
						} else if (canUser && !(canUser(DOWNLOAD) || canUser(UPLOAD_DOWNLOAD))) { // check Permissions
							isDisabled = true;
						}
						break;
					default:
				}
				return isDisabled;
			},
			isNoSelectorSelected = () => {
				return selectorId && !selectorSelected;
			},
			isEmptySelection = () => {
				return _.isEmpty(selection);
			},
			isMultiSelection = () => {
				return _.isArray(selection) && selection.length > 1;
			},
			isProtectedValue = () => {
				if (!protectedValues) {
					return false;
				}
				const value = selection[0]?.id;
				if (_.isNil(value)) {
					return false;
				}
				return inArray(value, protectedValues);
			},
			getPresetButtonProps = (type) => {
				let key,
					text,
					handler,
					icon = null,
					isDisabled = false;
				switch(type) {
					case ADD:
						key = 'addBtn';
						text = 'Add';
						handler = (parent, e) => {
							onAdd();
						};
						icon = Plus;
						if (isNoSelectorSelected() ||
							(isTree && isEmptySelection())
						) {
							isDisabled = true;
						}
						break;
					case EDIT:
						key = 'editBtn';
						text = 'Edit';
						handler = (parent, e) => {
							onEdit();
						};
						icon = Edit;
						if (isNoSelectorSelected() ||
							isEmptySelection() ||
							isMultiSelection() ||
							isProtectedValue() ||
							(canRecordBeEdited && !canRecordBeEdited(selection))
						) {
							isDisabled = true;
						}
						break;
					case DELETE:
						key = 'deleteBtn';
						text = 'Delete';
						handler = onDelete;
						handler = (parent, e) => {
							onDelete();
						};
						icon = Trash;
						if (isNoSelectorSelected() ||
							isEmptySelection() ||
							isMultiSelection() ||
							isProtectedValue() ||
							(canRecordBeEdited && !canRecordBeEdited(selection))
						) {
							isDisabled = true;
						}
						if (isTree) {
							const isRootNode = !!_.find(selection, { isRoot: true, });
							if (isRootNode && !canDeleteRootNode) {
								isDisabled = true;
							}
						}
						break;
					case VIEW:
						key = 'viewBtn';
						text = 'View';
						handler = (parent, e) => onView();
						icon = Eye;
						isDisabled = !selection.length || selection.length !== 1;
						if (isNoSelectorSelected() ||
							isEmptySelection() ||
							isMultiSelection()
						) {
							isDisabled = true;
						}
						break;
					case COPY:
						key = 'copyBtn';
						text = 'Copy to Clipboard';
						handler = (parent, e) => onCopyToClipboard();
						icon = Clipboard;
						isDisabled = !selection.length;
						if (isNoSelectorSelected() ||
							isEmptySelection()
						) {
							isDisabled = true;
						}
						break;
					case DUPLICATE:
						key = 'duplicateBtn';
						text = 'Duplicate';
						handler = (parent, e) => {
							onDuplicate();
						};
						icon = Duplicate;
						isDisabled = !selection.length || selection.length !== 1;
						if (isNoSelectorSelected() ||
							isEmptySelection() ||
							isMultiSelection() ||
							(canRecordBeDuplicated && !canRecordBeDuplicated(selection))
						) {
							isDisabled = true;
						}
						break;
					// case PRINT:
					// 	text = 'Print';
					// 	handler = onPrint;
					// 	icon = Print;
					// 	break;
					case UPLOAD_DOWNLOAD:
						key = 'uploadDownloadBtn';
						text = 'Upload/Download';
						handler = (parent, e) => onUploadDownload();
						icon = UploadDownload;
						break;
					case DOWNLOAD:
						key = 'downloadBtn';
						text = 'Download';
						handler = (parent, e) => onDownload();
						icon = Download;
						break;
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
					if ((!userCanEdit && inArray(type, [ADD, EDIT, DELETE, DUPLICATE,])) ||
						(!userCanView && type === VIEW)) {
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
			},
			onUploadDownload = () => {
				showModal({
					body: <UploadsDownloadsWindow
								reference="uploadsDownloads"
								onClose={hideModal}
								Repository={Repository}
								columnsConfig={props.columnsConfig}
								uploadHeaders={uploadHeaders}
								uploadParams={uploadParams}
								onUpload={onUpload}
								downloadHeaders={downloadHeaders}
								downloadParams={downloadParams}
							/>,
					onCancel: hideModal,
				});
			},
			onDownload = () => {
				showModal({
					body: <UploadsDownloadsWindow
								reference="downloads"
								onClose={hideModal}
								isDownloadOnly={true}
								Repository={Repository}
								columnsConfig={props.columnsConfig}
								downloadHeaders={downloadHeaders}
								downloadParams={downloadParams}
							/>,
					onCancel: hideModal,
				});
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
					alreadyHasWithPresetButtons={true}
					ref={ref}
					contextMenuItems={[
						...localContextMenuItems,
						...contextMenuItems,
					]}
					additionalToolbarButtons={[
						...localAdditionalToolbarButtons,
						...additionalToolbarButtons,
					]}
					onChangeColumnsConfig={onChangeColumnsConfigDecorator}
				/>;
	});
}