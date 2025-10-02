import { useState, useEffect, useRef, } from 'react';
import {
	Box,
	HStack,
	Pressable,
	Spinner,
	Text,
	VStack,
} from '@project-components/Gluestack';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import {
	HORIZONTAL,
} from '../../Constants/Directions.js';
import {
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';
import UiGlobals from '../../UiGlobals.js';
import {
	FILE_MODE_IMAGE,
	FILE_MODE_FILE,
} from '../../Constants/File.js';
import clsx from 'clsx';
import oneHatData from '@onehat/data';
import * as yup from 'yup'; // https://github.com/jquense/yup#string
import { Avatar, Dropzone, FileMosaic, FileCard, FileInputButton, } from "@files-ui/react";
import TreePanel from '../../Components/Panel/TreePanel.js';
import AttachmentsGridEditor from '../../Components/Grid/AttachmentsGridEditor.js';
import Form from '../../Components/Form/Form.js';
import {
	EDITOR_TYPE__PLAIN,
} from '../../Constants/Editor.js';
import {
	ATTACHMENTS_VIEW_MODES__ICON,
	ATTACHMENTS_VIEW_MODES__LIST,
} from '../../Constants/Attachments.js';
import inArray from '../../Functions/inArray.js';
import { withDragSource } from '../../Components/Hoc/withDnd.js';
import Button from '../../Components/Buttons/Button';
import IconButton from '../../Components/Buttons/IconButton.js';
import Xmark from '../../Components/Icons/Xmark.js';
import Eye from '../../Components/Icons/Eye.js';
import Images from '../../Components/Icons/Images.js';
import List from '../../Components/Icons/List.js';
import ChevronLeft from '../../Components/Icons/ChevronLeft.js';
import ChevronRight from '../../Components/Icons/ChevronRight.js';
import withAlert from '../../Components/Hoc/withAlert.js';
import withComponent from '../../Components/Hoc/withComponent.js';
import withData from '../../Components/Hoc/withData.js';
import CenterBox from '../../Components/Layout/CenterBox.js';
import downloadInBackground from '../../Functions/downloadInBackground.js';
import downloadWithFetch from '../../Functions/downloadWithFetch.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import Folder from '../../Components/Icons/Folder.js';
import Plus from '../../Components/Icons/Plus.js';
import Trash from '../../Components/Icons/Trash.js';
import Edit from '../../Components/Icons/Edit.js';
import Rotate from '../../Components/Icons/Rotate.js';
import Download from '../../Components/Icons/Download.js';
import delay from '../../Functions/delay.js';
import _ from 'lodash';

const
	EXPANDED_MAX = 100,
	COLLAPSED_MAX = 4,
	isPwa = typeof window !== 'undefined' && !!window?.navigator?.standalone;

function FileCardCustom(props) {
	const {
			id,
			name: filename,
			type: mimetype,
			onDelete,
			onSee,
			downloadUrl,
			uploadStatus,
			// Drag props
			isDragSource = false,
			dragSourceType = 'Attachments',
			dragSourceItem = {},
			item, // The actual attachment entity
		} = props,
		isDownloading = uploadStatus && inArray(uploadStatus, ['preparing', 'uploading', 'success']),
		isPdf = mimetype === 'application/pdf';

	let cardContent = 
		<Pressable
			onPress={() => {
				downloadInBackground(downloadUrl);
			}}
			className="Pressable px-3 py-1 items-center flex-row rounded-[5px] border border-primary.700"
		>
			{isDownloading &&
				<Spinner className="mr-2" />}
			{onSee && isPdf &&
				<IconButton
					className="mr-1"
					icon={Eye}
					onPress={() => onSee(id)}
				/>}
			<Text>{filename}</Text>
			{onDelete &&
				<IconButton
					className="ml-1"
					icon={Xmark}
					onPress={() => onDelete(id)}
				/>}
		</Pressable>;

	// Wrap with drag source if needed
	if (isDragSource) {
		const DragSourceFileCard = withDragSource(({ children, ...dragProps }) => children);
		return <DragSourceFileCard
					isDragSource={isDragSource}
					dragSourceType={dragSourceType}
					dragSourceItem={dragSourceItem}
				>
					{cardContent}
				</DragSourceFileCard>;
	}

	return cardContent;
}

function DraggableFileMosaic(props) {
	const {
			isDragSource = false,
			dragSourceType = 'Attachments',
			dragSourceItem = {},
			onDragStart,
			onDragEnd,
			...fileMosaicProps
		} = props;

	// If not a drag source, just return the regular FileMosaic
	if (!isDragSource) {
		return <FileMosaic {...fileMosaicProps} />;
	}

	// Create a completely separate draggable container
	const DragSourceContainer = withDragSource(({ dragSourceRef, ...dragProps }) => {
		return (
			<div 
				ref={dragSourceRef}
				style={{ 
					display: 'inline-block',
					cursor: 'grab'
				}}
			>
				<FileMosaic 
					{...fileMosaicProps} 
					// Disable any built-in drag functionality of FileMosaic
					draggable={false}
				/>
			</div>
		);
	});
	
	// Add drag handlers to the dragSourceItem
	const enhancedDragSourceItem = {
		...dragSourceItem,
		onDragStart: () => {
			if (dragSourceItem.onDragStart) {
				dragSourceItem.onDragStart();
			}
			if (onDragStart) {
				onDragStart();
			}
		}
	};
	
	return <DragSourceContainer
				isDragSource={true}
				dragSourceType={dragSourceType}
				dragSourceItem={enhancedDragSourceItem}
				onDragEnd={onDragEnd}
			/>;
}


// Note this component uploads only one file per server request---
// it doesn't upload multiple files simultaneously.

function AttachmentsElement(props) {

	if (CURRENT_MODE !== UI_MODE_WEB) {
		throw new Error('Not yet implemented except for web.');
	}

	const {
			canCrud = true,
			_dropZone = {},
			_fileMosaic = {},
			useFileMosaic = true,
			usesDirectories = false,
			isDirectoriesByModel = true, // if false, directories are by modelid
			AttachmentDirectories,
			initialViewMode = ATTACHMENTS_VIEW_MODES__ICON,
			accept, // 'image/*'
			maxFiles = null,
			disabled = false,
			clickable = true,
			confirmBeforeDelete = false,
			extraUploadData = {},
			expandedMax = EXPANDED_MAX,
			collapsedMax = COLLAPSED_MAX,
			autoUpload = true,
			onAfterDropzoneChange, // fn, should return true if it mutated the files array
			onUpload,
			onDelete,

			// withComponent
			self,

			// parentContainer
			selectorSelected,
			selectorSelectedField = 'id',

			// withData
			Repository: Attachments,

			// withAlert
			showModal,
			hideModal,
			updateModalBody,
			alert,
			confirm,

		} = props,
		styles = UiGlobals.styles,
		model = _.isArray(selectorSelected) && selectorSelected[0] ? selectorSelected[0].repository?.name : selectorSelected?.repository?.name,
		modelidCalc = _.isArray(selectorSelected) ? _.map(selectorSelected, (entity) => entity[selectorSelectedField]) : selectorSelected?.[selectorSelectedField],
		modelid = useRef(modelidCalc),
		id = props.id || (model && modelid.current ? `attachments-${model}-${modelid.current}` : 'attachments'),
		forceUpdate = useForceUpdate(),
		iconBlobUrlsRef = useRef(new Set()), // to track created blob URLs for cleanup
		modalBlobUrlsRef = useRef(new Set()), // For modal images
		[isReady, setIsReady] = useState(false),
		[isUploading, setIsUploading] = useState(false),
		[isLoading, setIsLoading] = useState(false),
		[isDirectoriesLoading, setIsDirectoriesLoading] = useState(false),
		[viewMode, setViewModeRaw] = useState(initialViewMode),
		setViewMode = (newViewMode) => {
			setViewModeRaw(newViewMode);
			if (id) {
				setSaved(id + '-viewMode', newViewMode);
			}
		},
		[showAll, setShowAll] = useState(false),
		[isDragging, setIsDragging] = useState(false),
		treeSelectionRaw = useRef([]),
		setTreeSelection = (selection) => {
			treeSelectionRaw.current = selection;
			forceUpdate();
		},
		getTreeSelection = () => {
			return treeSelectionRaw.current;
		},
		treeSelection = getTreeSelection(),

		// icon view only
		setFilesRaw = useRef([]),
		setFiles = (files) => {
			setFilesRaw.current = files;
			forceUpdate();
		},
		getFiles = () => {
			return setFilesRaw.current;
		},
		buildFiles = async () => {
			cleanupIconBlobUrls();

			// FilesUI doesn't allow headers to be passed with URLs,
			// but these URLs require authentication.
			// So we need to fetch the files ourselves, create blob URLs, 
			// and pass those to FilesUI.
			const files = await Promise.all(_.map(Attachments.entities, async (entity) => {
				let imageUrl = entity.attachments__uri;
				
				// create authenticated blob URLs
				try {
					const response = await fetch(entity.attachments__uri, {
						headers: Attachments.headers // Use your repository's headers
					});
					
					if (response.ok) {
						const blob = await response.blob();
						imageUrl = URL.createObjectURL(blob);
						iconBlobUrlsRef.current.add(imageUrl);
					}
				} catch (error) {
					console.warn('Failed to fetch authenticated image:', error);
				}

				return {
					id: entity.id, //	string | number	The identifier of the file
					// file: null, //	File	The file object obtained from client drop or selection
					name: entity.attachments__filename, // string	The name of the file
					type: entity.attachments__mimetype, // string	The file mime type.
					size: entity.attachments__size, //	number	The size of the file in bytes.
					// valid: null, //	boolean	If present, it will show a valid or rejected message ("valid", "denied"). By default valid is undefined.
					// errors: null, //	string[]	The list of errors according to the validation criteria or the result of the given custom validation function.
					// uploadStatus: null, //	UPLOADSTATUS	The current upload status. (e.g. "uploading").
					// uploadMessage: null, //	string	A message that shows the result of the upload process.
					imageUrl: imageUrl, //	string	A string representation or web url of the image that will be set to the "src" prop of an <img/> tag. If given, the component will use this image source instead of reading the image file.
					downloadUrl: entity.attachments__uri, //	string	The url to be used to perform a GET request in order to download the file. If defined, the download icon will be shown.
					// progress: null, //	number	The current percentage of upload progress. This value will have a higher priority over the upload progress value calculated inside the component.
					// extraUploadData: null, //	Record<string, any>	The additional data that will be sent to the server when files are uploaded individually
					// extraData: null, //	Object	Any kind of extra data that could be needed.
					// serverResponse: null, //	ServerResponse	The upload response from server.
					// xhr: null, //	XMLHttpRequest	A reference to the XHR object that allows the upload, progress and abort events.
				
				};
			}));
			setFiles(files);
		},
		clearFiles = () => {
			cleanupIconBlobUrls();
			setFiles([]);
		},
		cleanupIconBlobUrls = () => {
			iconBlobUrlsRef.current.forEach((url) => {
				if (url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
			iconBlobUrlsRef.current.clear();
		},
		cleanupModalBlobUrls = () => {
			modalBlobUrlsRef.current.forEach((url) => {
				if (url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
			modalBlobUrlsRef.current.clear();
		},
		onFileDelete = (id) => {
			const
				files = getFiles(),
				file = _.find(files, { id });
			if (confirmBeforeDelete) {
				confirm('Are you sure you want to delete the file "' + file.name + '"?', () => doDelete(id));
			} else {
				doDelete(id);
			}
		},
		toggleShowAll = () => {
			setShowAll(!showAll);
		},
		doDelete = (id) => {
			const
				files = getFiles(),
				file = Attachments.getById(id);
			if (file) {
				// if the file exists in the repository, delete it there
				Attachments.deleteById(id);
				Attachments.save();

			} else {
				// simply remove it from the files array
				const newFiles = [];
				_.each(files, (file) => {
					if (file.id !== id) {
						newFiles.push(file);
					}
				});
				setFiles(newFiles);
			}
			if (onDelete) {
				onDelete(id);
			}
		},
		onDownload = (id, url) => {
			if (isPwa) {
				// This doesn't work because iOS doesn't allow you to open another window within a PWA.
				// downloadWithFetch(url);
				
				alert('Files cannot be downloaded and viewed within an iOS PWA. Please use the Safari browser instead.');
			} else {
				downloadInBackground(url);
			}
		},

		// dropzone
		onDropzoneChange = async (files) => {
			if (!files.length) {
				alert('No files accepted. Perhaps they were too large or the wrong file type?');
				return;
			}
			if (usesDirectories) {
				const treeSelection = getTreeSelection();
				if (!treeSelection[0] || !treeSelection[0].id) {
					alert('Please select a directory to upload the files to.');
					return;
				}
			}
			setFiles(files);
			_.each(files, (file) => {
				file.extraUploadData = {
					model,
					modelid: modelid.current,
					...extraUploadData,
				};
				if (usesDirectories) {
					file.extraUploadData.attachment_directory_id = treeSelection[0].id;
				}
			});
			if (onAfterDropzoneChange) {
				const isChanged = await onAfterDropzoneChange(files);
				if (isChanged) {
					forceUpdate();
				}
			}
		},
		onUploadStart = (files) => {
			setIsUploading(true);
		},
		onUploadFinish = (files) => {
			let isDoneUploading = true,
				isError = false;

			_.each(files, (file) => {
				if (!file.xhr || file.xhr.status !== 200) {
					isDoneUploading = false;
					return false; // break
				}
			});

			if (isDoneUploading) {
				_.each(files, (file) => {
					if (file.uploadStatus === 'error') {
						isError = true;
						const msg = file.serverResponse?.payload || 'An error occurred';
						alert(msg);
						return false;
					}
				});
				if (!isError) {
					setIsUploading(false);
					Attachments.reload();
					if (onUpload) {
						onUpload(files);
					}
				}
			}
		},

		// Lightbox
		buildModalBody = async (item) => {
			const
				currentFile = item,
				currentIx = Attachments.getIxById(item.id),
				prevFile = Attachments.getByIx(currentIx - 1),
				nextFile = Attachments.getByIx(currentIx + 1),
				isPrevDisabled = !prevFile,
				isNextDisabled = !nextFile,
				onPrev = async () => {
					cleanupModalBlobUrls();
					const modalBody = await buildModalBody(prevFile);
					updateModalBody(modalBody);
				},
				onNext = async () => {
					cleanupModalBlobUrls();
					const modalBody = await buildModalBody(nextFile);
					updateModalBody(modalBody);
				},
				isPdf = currentFile.attachments__mimetype === 'application/pdf';
				
			let url = currentFile.attachments__uri;
			try {
				const response = await fetch(currentFile.attachments__uri, {
					headers: Attachments.headers // Use your repository's headers
				});
				
				if (response.ok) {
					const blob = await response.blob();
					url = URL.createObjectURL(blob);
					modalBlobUrlsRef.current.add(url);
				}
			} catch (error) {
				console.warn('Failed to fetch authenticated file for modal:', error);
			}
			
			let body = null;
			if (isPdf) {
				body = <iframe
							src={url}
							className="w-full h-full"
						/>;
			} else {
				body = <CenterBox className="w-full h-full">
							<img src={url} />
						</CenterBox>;
			}
			return <HStack
						className="w-full h-full"
					>
						<IconButton
							onPress={onPrev}
							className="Lightbox-prevBtn h-full w-[50px]"
							icon={ChevronLeft}
							isDisabled={isPrevDisabled}
						/>
						{body}
						<IconButton
							onPress={onNext}
							className="Lightbox-prevBtn h-full w-[50px]"
							icon={ChevronRight}
							isDisabled={isNextDisabled}
						/>
					</HStack>;
		},
		onViewLightbox = async (item) => {
			cleanupModalBlobUrls();
			const modalBody = await buildModalBody(item);
			showModal({
				title: 'Lightbox',
				body: modalBody,
				canClose: true,
				includeCancel: true,
				w: 1920,
				h: 1080,
				onClose: cleanupModalBlobUrls,
			});
		},

		// AttachmentDirectories
		onCreateDirectory = () => {
			const treeSelection = getTreeSelection();
			showModal({
				title: 'New Directory',
				w: 400,
				h: 200,
				canClose: true,
				includeReset: false,
				includeCancel: false,
				body: <Form
							editorType={EDITOR_TYPE__PLAIN}
							items={[
								{
									type: 'Input',
									name: 'directoryName',
									placeholder: 'New Directory Name',
								}
							]}
							additionalFooterButtons={[
								{
									text: 'Cancel',
									onPress: hideModal,
									skipSubmit: true,
									variant: 'outline',
								}
							]}
							validator={yup.object({
								directoryName: yup.string().required(),
							})}
							onSave={async (values)=> {
								const { directoryName } = values;
								await AttachmentDirectories.add({
									name: directoryName,
									model: selectorSelected.repository.name,
									modelid: selectorSelected[selectorSelectedField],
									parentId: treeSelection?.[0]?.id || null,
								});
								hideModal();
							}}
						/>,
			});
		},
		onDeleteDirectory = async () => {

			const
				attachmentDirectory = getTreeSelection()[0],
				isRoot = attachmentDirectory.isRoot;
			if (isRoot) {
				alert('Cannot delete the root directory.');
				return;
			}


			// check if there are any attachments in this directory or its subdirectories
			const
				url = AttachmentDirectories.api.baseURL + 'AttachmentDirectories/hasAttachments',
				data = {
					attachment_directory_id: treeSelection[0].id,
				},
				result = await AttachmentDirectories._send('POST', url, data);
			
			const {
				root,
				success,
				total,
				message
			} = AttachmentDirectories._processServerResponse(result);

			if (!success) {
				alert(message);
				return;
			}

			if (root.hasAttachments) {
				alert('Cannot delete a directory that contains attachments somewhere down its hierarchy. Please move or delete the attachments first.');
				return;
			}


			// transfer selection to the parent node
			const
				parentNode = attachmentDirectory.getParent(),
				newSelection = [parentNode];
			setTreeSelection(newSelection);
			self.children.tree.setSelection(newSelection);

			
			// now delete it
			await attachmentDirectory.delete();
			self.children.tree.buildAndSetTreeNodeData();
			
		},
		onRenameDirectory = () => {
			const attachmentDirectory = getTreeSelection()[0];
			showModal({
				title: 'Rename Directory',
				w: 400,
				h: 200,
				canClose: true,
				includeReset: false,
				includeCancel: false,
				body: <Form
							editorType={EDITOR_TYPE__PLAIN}
							items={[
								{
									type: 'Input',
									name: 'directoryName',
									placeholder: 'New Directory Name',
								}
							]}
							additionalFooterButtons={[
								{
									text: 'Cancel',
									onPress: hideModal,
									skipSubmit: true,
									variant: 'outline',
								}
							]}
							startingValues={{
								directoryName: attachmentDirectory.attachment_directories__name,
							}}
							validator={yup.object({
								directoryName: yup.string().required(),
							})}
							onSave={async (values)=> {
								const {
									directoryName,
								} = values;
								attachmentDirectory.attachment_directories__name = directoryName;
								await delay(500);
								await attachmentDirectory.save();
								await delay(500);
								self.children.tree.buildAndSetTreeNodeData();
								hideModal();

			
							}}
						/>,
			});
		},
		onReloadDirectories = async () => {
			await AttachmentDirectories.loadRootNodes(2);
			const rootNodes = AttachmentDirectories.getRootNodes();
			if (rootNodes) {
				setTreeSelection(rootNodes);
				self.children.tree.setSelection(rootNodes);
			}
		};

	if (!_.isEqual(modelidCalc, modelid.current)) {
		modelid.current = modelidCalc;
	}

	useEffect(() => {

		if (!model) {
			return () => {};
		}

		const
			setTrue = () => setIsLoading(true),
			setFalse = () => setIsLoading(false),
			setDirectoriesTrue = () => setIsDirectoriesLoading(true),
			setDirectoriesFalse = () => setIsDirectoriesLoading(false);

		Attachments.on('beforeLoad', setTrue);
		Attachments.on('load', setFalse);
		Attachments.on('load', buildFiles);
		if (usesDirectories) {
			AttachmentDirectories.on('beforeLoad', setDirectoriesTrue);
			AttachmentDirectories.on('loadRootNodes', setDirectoriesFalse);
		}

		(async () => {

			if (modelid.current && !_.isArray(modelid.current)) {
				const
					currentConditions = Attachments.getParamConditions() || {},
					newConditions = {
						'conditions[Attachments.model]': model,
						'conditions[Attachments.modelid]': modelid.current,
					},
					currentPageSize = Attachments.pageSize,
					newPageSize = showAll ? expandedMax : collapsedMax;
				
				// figure out conditions
				if (accept) {
					let name = 'mimetype IN',
						mimetypes;
					if (_.isString(accept)) {
						if (accept.match(/,/)) {
							mimetypes = accept.split(',');
						} else {
							name = 'mimetype LIKE';
							mimetypes = accept.replace('*', '%');
						}
					} else if (_.isArray(accept)) {
						mimetypes = accept;
					}
					newConditions['conditions[Attachments.' + name + ']'] = mimetypes;
				}
				if (usesDirectories) {
					const treeSelection = getTreeSelection();
					newConditions['conditions[Attachments.attachment_directory_id]'] = treeSelection[0]?.id || null;
				}
				let doReload = false;
				if (!_.isEqual(currentConditions, newConditions)) {
					Attachments.setParams(newConditions);
					doReload = true;
				}

				// figure out pageSize
				if (!_.isEqual(currentPageSize, newPageSize)) {
					Attachments.setPageSize(newPageSize);
					doReload = true;
				}
				if (doReload) {
					await Attachments.load();
				}
				if (usesDirectories) {
					const
						wasAlreadyLoaded = AttachmentDirectories.isLoaded,
						currentConditions = AttachmentDirectories.getParamConditions() || {},
						newConditions = {
							'conditions[AttachmentDirectories.model]': selectorSelected.repository.name,
							'conditions[AttachmentDirectories.modelid]': selectorSelected[selectorSelectedField],
						};
					let doReload = false;
					if (!_.isEqual(currentConditions, newConditions)) {
						AttachmentDirectories.setParams(newConditions);
						doReload = true;
					}
					if (doReload) {
						// setTreeSelection([]); // clear it; otherwise we get stale nodes after reloading AttachmentDirectories
						await AttachmentDirectories.loadRootNodes(2);
						if (wasAlreadyLoaded) {
							const rootNodes = AttachmentDirectories.getRootNodes();
							if (rootNodes) {
								self.children.tree.setSelection(rootNodes);
							}
						}
					}
				}

				await buildFiles();
			} else {
				Attachments.clear();
				if (usesDirectories) {
					AttachmentDirectories.clear();
				}
				clearFiles();
			}


			// Load saved view mode preference before setting ready
			if (id && !isReady) {
				const savedViewMode = await getSaved(id + '-viewMode');
				if (!_.isNil(savedViewMode)) {
					setViewModeRaw(savedViewMode);
				}
			}

			if (!isReady) {
				setIsReady(true);
			}
			
		})();

		return () => {
			Attachments.off('beforeLoad', setTrue);
			Attachments.off('load', setFalse);
			Attachments.off('load', buildFiles);
			if (usesDirectories) {
				AttachmentDirectories.off('beforeLoad', setDirectoriesTrue);
				AttachmentDirectories.off('loadRootNodes', setDirectoriesFalse);
			}
			cleanupIconBlobUrls();
			cleanupModalBlobUrls();
		};
	}, [model, modelid.current, showAll, getTreeSelection()]);

	if (!isReady) {
		return null;
	}

	if (self) {
		self.getFiles = getFiles;
		self.setFiles = setFiles;
		self.clearFiles = clearFiles;
	}

	if (canCrud) {
		_fileMosaic.onDelete = onFileDelete;
	}
	const files = getFiles();
	let content = null;
	// icon or list view
	if (viewMode === ATTACHMENTS_VIEW_MODES__ICON || isUploading) {
		content = <VStack
						className={clsx(
							'AttachmentsElement-icon-VStack1',
							'h-full',
							'flex-1',
							'border',
							'p-1',
							isLoading ? [
								'border-t-4',
								'border-t-[#f00]',
							] : null,
						)}
					>
						<HStack
							className={clsx(
								'AttachmentsElement-HStack',
								'gap-2',
								'flex-wrap',
								'items-start',
								files.length === 0 ? [
									// So the 'No files' text is centered
									'justify-center',
									'items-center',
									'h-full',
								] : null,
							)}
						>
							{files.length === 0 && <Text className="text-grey-600 italic">No files {usesDirectories ? 'in this directory' : ''}</Text>}
							{files.map((file) => {
								const fileEntity = Attachments.getById(file.id);
								let eyeProps = {};
								if (file.type && (file.type.match(/^image\//) || file.type === 'application/pdf')) {
									eyeProps = {
										onSee: () => {
											onViewLightbox(fileEntity);
										},
									};
								}

								// Create drag source item for this file
								const dragSourceItem = {
									item: fileEntity, // Get the actual entity
									sourceComponentRef: null, // Could be set to a ref if needed
									getDragProxy: () => {
										// Custom drag preview for file items
										return <VStack className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg max-w-[200px]">
													<Text className="font-semibold text-gray-800">{file.name}</Text>
													<Text className="text-sm text-gray-600">File</Text>
												</VStack>;
									}
								};

								return <Box
											key={file.id}
											className="mr-2"
										>
											{useFileMosaic &&
												<DraggableFileMosaic
													{...file}
													backgroundBlurImage={false}
													onDownload={onDownload}
													{..._fileMosaic}
													{...eyeProps}
													isDragSource={canCrud && usesDirectories}
													dragSourceType="Attachments"
													dragSourceItem={dragSourceItem}
													onDragStart={() => {
														setTimeout(() => setIsDragging(true), 50); // Delay to avoid interfering with drag initialization
													}}
													onDragEnd={() => {
														setIsDragging(false);
													}}
												/>}
											{!useFileMosaic &&
												<FileCardCustom
													{...file}
													backgroundBlurImage={false}
													{..._fileMosaic}
													{...eyeProps}
													isDragSource={canCrud && usesDirectories}
													dragSourceType="Attachments"
													dragSourceItem={dragSourceItem}
													item={Attachments.getById(file.id)}
													onDragStart={() => {
														setTimeout(() => setIsDragging(true), 50); // Delay to avoid interfering with drag initialization
													}}
													onDragEnd={() => {
														setIsDragging(false);
													}}
												/>}
										</Box>;
							})}
						</HStack>
						{Attachments.total <= collapsedMax ? null :
							<Button
								onPress={toggleShowAll}
								className="AttachmentsElement-toggleShowAll mt-2"
								text={'Show ' + (showAll ? ' Less' : ' All ' + Attachments.total)}
								_text={{
									className: `
										text-grey-600
										italic
										text-left
										w-full
									`,
								}}
								variant="outline"
							/>}
					</VStack>;
	} else if (viewMode === ATTACHMENTS_VIEW_MODES__LIST) {
		content = <AttachmentsGridEditor
						Repository={Attachments}
						selectionMode={SELECTION_MODE_MULTI}
						showSelectHandle={false}
						disableAdd={true}
						disableEdit={true}
						disableView={true}
						disableCopy={true}
						disableDuplicate={true}
						disableDelete={!canCrud}
						className="flex-1 h-full" // Ensure it takes up full space
						onDragStart={() => {
							setTimeout(() => setIsDragging(true), 50); // Delay to avoid interfering with drag initialization
						}}
						onDragEnd={() => {
							setIsDragging(false);
						}}
						columnsConfig={[
							{
								id: 'view',
								header: 'View',
								w: 60,
								isSortable: false,
								isEditable: false,
								isReorderable: false,
								isResizable: false,
								isHidable: false,
								renderer: (item) => {
									return <IconButton
												className="w-[60px]"
												icon={Eye}
												_icon={{
													size: 'xl',
												}}
												onPress={() => onViewLightbox(item)}
												tooltip="View"
											/>;
								},
							},
							// {
							// 	id: 'download',
							// 	header: 'Get',
							// 	w: 60,
							// 	isSortable: false,
							// 	isEditable: false,
							// 	isReorderable: false,
							// 	isResizable: false,
							// 	isHidable: false,
							// 	renderer: (item) => {
							// 		return <IconButton
							// 					className="w-[60px]"
							// 					icon={Download}
							// 					_icon={{
							// 						size: 'xl',
							// 					}}
							// 					onPress={() => onDownload(item.id)}
							// 					tooltip="Download"
							// 				/>;
							// 	},
							// },
							{
								"id": "attachments__filename",
								"header": "Filename",
								"fieldName": "attachments__filename",
								"isSortable": true,
								"isEditable": true,
								"isReorderable": true,
								"isResizable": true,
								"w": 250
							},
							{
								"id": "attachments__size_formatted",
								"header": "Size Formatted",
								"fieldName": "attachments__size_formatted",
								"isSortable": false,
								"isEditable": false,
								"isReorderable": true,
								"isResizable": true,
								"w": 100
							},
						]}
						areRowsDragSource={canCrud}
						rowDragSourceType="Attachments"
						getCustomDragProxy={(item, selection) => {
							let selectionCount = selection?.length || 1,
								displayText = item.attachments__filename || 'Selected TreeNode';
							return <VStack className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg max-w-[200px]">
										<Text className="font-semibold text-gray-800">{displayText}</Text>
										{selectionCount > 1 && 
											<Text className="text-sm text-gray-600">(+{selectionCount -1} more item{selectionCount > 2 ? 's' : ''})</Text>
										}
									</VStack>;
						}}

					/>;
	}

	// switches for icon/list view
	content = <VStack
				className={clsx(
					'w-full',
					'h-full',
				)}
			>
				<HStack
					className={clsx(
						'h-[30px]',
						'w-full',
						'gap-1',
						'p-1',
						'justify-start',
						'items-center',
						'bg-primary-500',
					)}
				>
					<IconButton
						onPress={() => setViewMode(ATTACHMENTS_VIEW_MODES__ICON)}
						icon={Images}
						className={clsx(
							viewMode === ATTACHMENTS_VIEW_MODES__ICON ? 'bg-gray-400' : null,
							'w-[25px]',
							'h-[25px]',
							'px-[2px]',
							'py-[2px]',
						)}
						tooltip="Icon View"
					/>
					<IconButton
						onPress={() => setViewMode(ATTACHMENTS_VIEW_MODES__LIST)}
						icon={List}
						className={clsx(
							viewMode === ATTACHMENTS_VIEW_MODES__LIST ? 'bg-gray-400' : null,
							'w-[25px]',
							'h-[25px]',
							'px-[2px]',
							'py-[2px]',
						)}
						tooltip="List View"
					/>
				</HStack>

				{content}

			</VStack>;
	
	// Always wrap content in dropzone when canCrud is true, but conditionally disable functionality
	if (canCrud) {
		content = <Dropzone
						value={files}
						onChange={isDragging ? () => {} : onDropzoneChange} // Disable onChange when dragging
						accept={isDragging ? undefined : accept} // Remove accept types when dragging
						maxFiles={isDragging ? 0 : maxFiles} // Set to 0 when dragging to prevent drops
						maxFileSize={styles.ATTACHMENTS_MAX_FILESIZE}
						autoClean={true}
						uploadConfig={{
							url: Attachments.api.baseURL + Attachments.schema.name + '/uploadAttachment',
							method: 'POST',
							headers: Attachments.headers,
							autoUpload,
						}}
						headerConfig={{
							className: '!hidden',
							deleteFiles: false,
						}}
						className="attachments-dropzone flex-1 h-full" // Add flex classes to ensure full height
						onUploadStart={onUploadStart}
						onUploadFinish={onUploadFinish}
						background={styles.ATTACHMENTS_BG}
						color={styles.ATTACHMENTS_COLOR}
						minHeight={150}
						footer={false}
						clickable={viewMode === ATTACHMENTS_VIEW_MODES__ICON && !isDragging ? clickable : false} // Disable clickable when dragging
						{..._dropZone}
					>
						{content}
					</Dropzone>;
	}

	// directories
	if (usesDirectories) {
		content = <HStack className="h-full w-full">
						<TreePanel
							_panel={{
								title: 'Directories',
								isScrollable: true,
								isCollapsible: false,
								isCollapsed: false,
								collapseDirection: HORIZONTAL,
								disableTitleChange: true,
								className: clsx(
									'TreePanel-Panel',
									'h-full',
									'w-1/3',
								),
							}}
							_tree={{
								reference: 'tree',
								parent: self,
								Repository: AttachmentDirectories,
								autoSelectRootNode: true,
								allowToggleSelection: false,
								allowDeselectAll: false,
								forceSelectionOnCollapse: true,
								showSelectHandle: canCrud,
								useFilters: false,
								showHeaderToolbar: false,
								canNodesMoveInternally: canCrud,
								hideReloadBtn: true,
								className: clsx(
									'TreePanel-Tree',
									'h-full',
									'w-full',
									'min-w-0', // override the Tree's min-w setting
									'flex-none',
									isDirectoriesLoading ? [
										'border-t-4',
										'border-t-[#f00]',
									] : null,
								),
								areNodesDropTarget: canCrud,
								dropTargetAccept: 'Attachments',
								canNodeAcceptDrop: (targetNode, draggedItem) => {
									// disallow drop onto its parent
									if (draggedItem.item.attachments__attachment_directory_id === targetNode.id) {
										return false;
									}
									return true;
								},
								onNodeDrop: async (targetNode, droppedItem) => {

									let selectedNodes = [];
									if (droppedItem.getSelection) {
										selectedNodes = droppedItem.getSelection();
									}
									if (_.isEmpty(selectedNodes)) {
										selectedNodes = [droppedItem.item];
									}
									
									// set the attachment_directory_id of the draggedItems to the targetNode.id
									for (let i = 0; i < selectedNodes.length; i++) {
										const node = selectedNodes[i];
										node.attachments__attachment_directory_id = targetNode.id;
										await node.save();
									}

									// refresh the repository from the dragged node
									await selectedNodes[0].repository.reload();
								},
								getCustomDragProxy: (item, selection) => {
									let selectionCount = selection?.length || 1,
										displayText = item.displayValue || 'Selected TreeNode';
									return <VStack className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg max-w-[200px]">
												<Text className="font-semibold text-gray-800">{displayText}</Text>
												{selectionCount > 1 && 
													<Text className="text-sm text-gray-600">(+{selectionCount -1} more item{selectionCount > 2 ? 's' : ''})</Text>
												}
											</VStack>;
								},
								getNodeIcon: (node) => {
									return Folder;
								},
								onChangeSelection: (selection) => {
									setTreeSelection(selection);
								},
								additionalToolbarButtons: canCrud ? [
									{
										key: 'Plus',
										text: 'New Directory',
										handler: onCreateDirectory,
										icon: Plus,
										isDisabled: !treeSelection.length, // disabled if no selection
									},
									{
										key: 'Edit',
										text: 'Rename Directory',
										handler: onRenameDirectory,
										icon: Edit,
										isDisabled: !treeSelection.length, // disabled if no selection
									},
									{
										key: 'Trash',
										text: 'Delete Directory',
										handler: onDeleteDirectory,
										icon: Trash,
										isDisabled: !treeSelection.length || !treeSelection[0].parentId, // disabled if selection is root or none
									},
									{
										key: 'Reload',
										text: 'Reload Directories',
										handler: onReloadDirectories,
										icon: Rotate,
									},
								] : [],
							}}
						/>

						<Box className="w-2/3">
							{content}
						</Box>

					</HStack>;
	}

	let className = clsx(
		'AttachmentsElement',
		'testx',
		'w-full',
		'h-[400px]',
		'border-2',
		'rounded-[5px]',
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	return <Box className={className}>{content}</Box>;
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		const {
				usesDirectories = false,
			} = props,
			[isReady, setIsReady] = useState(false),
			[AttachmentDirectories] = useState(() => (usesDirectories ? oneHatData.getRepository('AttachmentDirectories', true) : null)), // lazy instantiator, so getRepository is called only once (it's unique, so otherwise, every time this renders, we'd get a new Repository!)
			[Attachments] = useState(() => oneHatData.getRepository('Attachments', true)); // same
		
		useEffect(() => {
			(async () => {
				Attachments.setBaseParams(props.baseParams || {}); // have to add the baseParams here, because we're bypassing withData
				if (!isReady) {
					setIsReady(true);
				}
			})();
		}, []);

		if (!isReady) {
			return null;
		}

		return <WrappedComponent
					reference="attachments"
					{...props}
					Repository={Attachments}
					AttachmentDirectories={AttachmentDirectories}
				/>;
	};
}

export default withAdditionalProps(withComponent(withAlert(withData(AttachmentsElement))));
