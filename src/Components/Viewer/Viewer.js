import { useEffect, useRef, useState, isValidElement, } from 'react';
import {
	Box,
	HStack,
	Icon,
	ScrollView,
	Text,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import {
	EDIT,
} from '../../Constants/Commands.js';
import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import {
	extractCssPropertyFromClassName,
	hasHeight,
	hasWidth,
	hasFlex,
} from '../../Functions/tailwindFunctions.js';
import UiGlobals from '../../UiGlobals.js';
import withComponent from '../Hoc/withComponent.js';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import buildAdditionalButtons from '../../Functions/buildAdditionalButtons.js';
import testProps from '../../Functions/testProps.js';
import DynamicFab from '../Fab/DynamicFab.js';
import Toolbar from '../Toolbar/Toolbar.js';
import ArrowUp from '../Icons/ArrowUp.js';
import Button from '../Buttons/Button.js';
import Label from '../Form/Label.js';
import Pencil from '../Icons/Pencil.js';
import Footer from '../Layout/Footer.js';
import _ from 'lodash';

function Viewer(props) {
	const {
			viewerCanDelete = false,
			items = [], // Columns, FieldSets, Fields, etc to define the form
			ancillaryItems = [], // additional items which are not controllable form elements, but should appear in the form
			columnDefaults = {}, // defaults for each Column defined in items (above)
			record,
			additionalViewButtons,
			canRecordBeEdited,
			viewerSetup, // this fn will be executed after the viewer setup is complete
			disableLabels = false,
		
			// withComponent
			self,

			// withData
			Repository,

			// withPermissions
			canUser,
			showPermissionsError,

			// withEditor
			editorType,
			onEditMode,
			onClose,
			onDelete,

			// parent container
			selectorId,
			selectorSelected,
			selectorSelectedField,

		} = props,
		scrollViewRef = useRef(),
		ancillaryItemsRef = useRef({}),
		ancillaryFabs = useRef([]),
		isMultiple = _.isArray(record),
		[containerWidth, setContainerWidth] = useState(),
		isSideEditor = editorType === EDITOR_TYPE__SIDE,
		styles = UiGlobals.styles,
		flex = props.flex || 1,
		buildFromItems = () => {
			return _.map(items, (item, ix) => buildFromItem(item, ix, columnDefaults));
		},
		buildFromItem = (item, ix, defaults) => {
			if (!item) {
				return null;
			}
			if (isValidElement(item)) {
				return item;
			}
			let {
					type,
					title,
					name,
					label,
					items,
					useSelectorId = false,
					isHidden = false,
					isHiddenInViewMode = false,
					getDynamicProps,
					...itemPropsToPass
				} = item,
				viewerTypeProps = {};

			if (isHidden) {
				return null;
			}
			if (isHiddenInViewMode) {
				return null;
			}
			if (!itemPropsToPass.className) {
				itemPropsToPass.className = '';
			}
			const propertyDef = name && Repository?.getSchema().getPropertyDefinition(name);
			if (!type) {
				if (propertyDef?.viewerType?.type) {
					const
						{
							type: t,
							...p
						} = propertyDef.viewerType;
					type = t;
					viewerTypeProps = p;
				} else {
					type = 'Text';
				}
			}
			const isCombo = type?.match && type.match(/Combo/);
			if (item.hasOwnProperty('autoLoad')) {
				viewerTypeProps.autoLoad = item.autoLoad;
			} else {
				if (isCombo && Repository?.isRemote && !Repository?.isLoaded) {
					viewerTypeProps.autoLoad = true;
				}
			}
			if (type?.match(/(Tag|TagEditor)$/)) {
				viewerTypeProps.isViewOnly = true;
			}
			const Element = getComponentFromType(type);

			if (inArray(type, ['Column', 'Row', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				let children;
				const style = {};
				if (type === 'Column') {
					const isEverythingInOneColumn = containerWidth < styles.FORM_ONE_COLUMN_THRESHOLD;
					if (itemPropsToPass.hasOwnProperty('flex')) {
						if (!isEverythingInOneColumn) {
							style.flex = itemPropsToPass.flex;
						}
						delete itemPropsToPass.flex;
					}
					if (itemPropsToPass.hasOwnProperty('w')) {
						if (!isEverythingInOneColumn) {
							style.width = itemPropsToPass.w;
						}
						delete itemPropsToPass.w;
					}
					// if (!style.flex && !style.width) {
					// 	style.flex = 1;
					// }
					itemPropsToPass.className += ' Column';
					// if (containerWidth < styles.FORM_ONE_COLUMN_THRESHOLD) {
					// 	// everything is in one column
					// 	if (hasFlex(itemPropsToPass)) {
					// 		itemPropsToPass.className = extractCssPropertyFromClassName(itemPropsToPass.className, 'flex').className;
					// 		if (itemPropsToPass.style?.flex) {
					// 			delete itemPropsToPass.style.flex;
					// 		}
					// 	}
					// 	if (hasWidth(itemPropsToPass)) {
					// 		itemPropsToPass.className = extractCssPropertyFromClassName(itemPropsToPass.className, 'width').className;
					// 		if (itemPropsToPass.style?.width) {
					// 			delete itemPropsToPass.style.width;
					// 		}
					// 	}
					// 	itemPropsToPass.className += ' w-full mb-1';
					// }
				}
				if (type === 'Row') {
					itemPropsToPass.className += ' Row w-full';
				}
				if (type === 'FieldSet' && item.showToggleAllCheckbox) {
					itemPropsToPass.showToggleAllCheckbox = false; // don't allow it in view mode
				}
				const itemDefaults = item.defaults || {};
				children = _.map(items, (item, ix) => {
					return buildFromItem(item, ix, {...defaults, ...itemDefaults});
				});

				let elementClassName = 'Viewer-ElementFromItem';
				const defaultsClassName = defaults.className;
				if (defaultsClassName) {
					elementClassName += ' ' + defaultsClassName;
				}
				const itemDefaultsClassName = itemDefaults.className;
				if (itemDefaultsClassName) {
					elementClassName += ' ' + itemDefaultsClassName;
				}
				const itemPropsToPassClassName = itemPropsToPass.className;
				if (itemPropsToPassClassName) {
					elementClassName += ' ' + itemPropsToPassClassName;
				}
				const editorTypeClassName = viewerTypeProps.className;
				if (editorTypeClassName) {
					elementClassName += ' ' + editorTypeClassName;
				}
				let defaultsToPass = {},
					itemDefaultsToPass = {};
				if (type === 'FieldSet') { // don't pass for Row and Column, as they use regular <div>s for web
					defaultsToPass = defaults;
					itemDefaultsToPass = itemDefaults;
				}
				return <Element
							key={ix}
							title={title}
							{...defaultsToPass}
							{...itemDefaultsToPass}
							{...itemPropsToPass}
							{...viewerTypeProps}
							className={elementClassName}
							style={style}
						>{children}</Element>;
			}

			if (!label && Repository && propertyDef?.title) {
				label = propertyDef.title;
			}

			let value = record?.properties[name]?.displayValue || null;
			const
				schema = record?.repository.getSchema(),
				propertyDefinition = schema?.getPropertyDefinition(name);
			if (propertyDefinition?.isFk) {
				// value above is the id, get the actual display value
				const fkDisplayField = propertyDefinition.fkDisplayField;
				if (record.properties[fkDisplayField]) {
					value = record.properties[fkDisplayField].displayValue;
				}
			}

			let elementClassName = `
				Viewer-field
				basis-auto
				grow
				shrink
			`;
			const defaultsClassName = defaults.className;
			if (defaultsClassName) {
				elementClassName += ' ' + defaultsClassName;
			}
			const itemPropsToPassClassName = itemPropsToPass.className;
			if (itemPropsToPassClassName) {
				elementClassName += ' ' + itemPropsToPassClassName;
			}
			const viewerTypeClassName = viewerTypeProps.className;
			if (viewerTypeClassName) {
				elementClassName += ' ' + viewerTypeClassName;
			}
			
			let element = <Element
								{...testProps('field-' + name)}
								value={value}
								isEditable={false}
								parent={self}
								reference={name}
								{...itemPropsToPass}
								{...viewerTypeProps}
								className={elementClassName}
							/>;

			if (item.additionalViewButtons) {
				element = <HStack className="Viewer-HStack1 flex-wrap">
								{element}
								{buildAdditionalButtons(item.additionalViewButtons, self)}
							</HStack>;
			}

			if (!disableLabels && label) {
				const style = {};
				if (defaults?.labelWidth) {
					style.width = defaults.labelWidth;
				}
				if (!style.width) {
					style.width = '50px';
				}
				if (containerWidth > styles.FORM_STACK_ROW_THRESHOLD) {
					element = <HStack className="Viewer-HStack2 py-1 w-full">
									<Label style={style}>{label}</Label>
									{element}
								</HStack>;
				} else {
					element = <VStack className="Viewer-HStack3 w-full py-1 mt-3">
									<Label style={style}>{label}</Label>
									{element}
								</VStack>;
				}
			}
			return <HStack key={ix} className="Viewer-HStack4 px-2 pb-1">{element}</HStack>;
		},
		buildAncillary = () => {
			const components = [];
			ancillaryFabs.current = [];
			if (ancillaryItems.length) {

				// add the "scroll to top" button
				ancillaryFabs.current.push({
					icon: ArrowUp,
					onPress: () => scrollToAncillaryItem(0),
					tooltip: 'Scroll to top',
					tooltipTriggerClassName: 'w-[50px]',
				});

				_.each(ancillaryItems, (item, ix) => {
					let {
						type,
						title = null,
						icon,
						selectorId = null,
						...itemPropsToPass
					} = item;
					if (isMultiple && type !== 'Attachments') {
						return;
					}
					if (icon) {
						// NOTE: this assumes that if one Ancillary item has an icon, they all do.
						// If they don't, the ix will be wrong.
						ancillaryFabs.current.push({
							icon,
							onPress: () => scrollToAncillaryItem(ix +1), // offset for the "scroll to top" button
							tooltip: title,
							tooltipTriggerClassName: 'w-[50px]',
						});
					}
					if (type.match(/Grid/) && !itemPropsToPass.h) {
						itemPropsToPass.h = 400;
					}
					let className = 'Viewer-ancillary-' + type;
					if (itemPropsToPass.className) {
						className += ' ' + itemPropsToPass.className;
					}

					const
						Element = getComponentFromType(type),
						element = <Element
										{...testProps('ancillary-' + type)}
										selectorId={selectorId}
										selectorSelected={selectorSelected || record}
										selectorSelectedField={selectorSelectedField}
										canEditorViewOnly={true}
										canCrud={false}
										uniqueRepository={true}
										parent={self}
										{...itemPropsToPass}
										className={className}
										canRowsReorder={false}
									/>;
					if (title) {
						if (record?.displayValue) {
							title += ' for ' + record.displayValue;
						}
						title = <Text className={`${styles.VIEWER_ANCILLARY_FONTSIZE} font-bold`}>{title}</Text>;
						if (icon) {
							title = <HStack className="items-center"><Icon as={icon} size="lg" className="mr-2" />{title}</HStack>
						}
					}
					components.push(<VStack
										ref={(el) => (ancillaryItemsRef.current[ix +1 /* offset for "scroll to top" */] = el)}
										key={'ancillary-' + ix}
										className="my-3"
									>
										{title}
										{element}
									</VStack>);
				});
			}
			return components;
		},
		scrollToAncillaryItem = (ix) => {
			ancillaryItemsRef.current[ix]?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		},
		onLayout = (e) => {
			setContainerWidth(e.nativeEvent.layout.width);
		};

	useEffect(() => {
		if (viewerSetup && record?.getSubmitValues) {
			viewerSetup(record.getSubmitValues());
		}
	}, [record]);
	
	if (self) {
		self.ref = scrollViewRef;
	}

	const
		showDeleteBtn = onDelete && viewerCanDelete,
		showCloseBtn = !isSideEditor,
		showFooter = (showDeleteBtn || showCloseBtn);
	let additionalButtons = null,
		viewerComponents = null,
		ancillaryComponents = null,
		fab = null;
	
	if (containerWidth) { // we need to render this component twice in order to get the container width. Skip this on first render
		additionalButtons = buildAdditionalButtons(additionalViewButtons);
		viewerComponents = buildFromItems();
		ancillaryComponents = buildAncillary();

		if (!_.isEmpty(ancillaryFabs.current)) {
			fab = <DynamicFab
						fabs={ancillaryFabs.current}
						collapseOnPress={false}
						tooltip="Scroll to Ancillary Item"
					/>;
		}
	}

	let canEdit = true;
	if (canRecordBeEdited && !canRecordBeEdited([record])) {
		canEdit = false;
	}

	const style = props.style || {};
	if (!hasWidth(props) && !hasFlex(props)) {
		style.flex = 1;
	}
	let className = `
		Viewer-VStackNative
		h-full
		bg-white
	`;
	if (props.className) {
		className += ' ' + props.className;
	}

	const footer = showFooter ? 
			<Footer className="justify-end">
				{showDeleteBtn && 
					<HStack className="flex-1 justify-start">
						<Button
							{...testProps('deleteBtn')}
							key="deleteBtn"
							onPress={onDelete}
							className={`
								text-white
								bg-warning-500
								hover:bg-warning-600
							`}
							text="Delete"
						/>
					</HStack>}
				{onClose && showCloseBtn &&
					<Button
						{...testProps('closeBtn')}
						key="closeBtn"
						onPress={onClose}
						className="text-white"
						text="Close"
					/>}
			</Footer> : null;

	const scrollToTopAnchor = <Box ref={(el) => (ancillaryItemsRef.current[0] = el)} className="h-0" />;
	return <VStackNative
				{...testProps(self)}
				style={style}
				onLayout={onLayout}
				className={className}
			>
				{containerWidth && <>

					<ScrollView
						_web={{ height: 1 }}
						ref={scrollViewRef}
						className={`
							Viewer-ScrollView
							w-full
							pb-1
							flex-1
						`}
					>
						{scrollToTopAnchor}
						{canEdit && onEditMode &&
							<Toolbar className="justify-end">
								<HStack className="flex-1 items-center">
									<Text className="text-[20px] ml-1 text-grey-500">View Mode</Text>
								</HStack>
								{(!canUser || canUser(EDIT)) &&
									<Button
										{...testProps('toEditBtn')}
										key="editBtn"
										onPress={onEditMode}
										icon={Pencil}
										_icon={{ 
											size: 'sm',
											className: 'text-white'
										}}
										className="text-white"
										text="To Edit"
										tooltip="Switch to Edit Mode"
									/>}
							</Toolbar>}
						
						{!_.isEmpty(additionalButtons) && 
							<Toolbar className="justify-end flex-wrap">
								{additionalButtons}
							</Toolbar>}
						
						{containerWidth >= styles.FORM_ONE_COLUMN_THRESHOLD ? <HStack className="Viewer-formComponents-HStack p-4 gap-4 justify-center">{viewerComponents}</HStack> : null}
						{containerWidth < styles.FORM_ONE_COLUMN_THRESHOLD ? <VStack className="Viewer-formComponents-VStack p-4">{viewerComponents}</VStack> : null}
						<VStack className="Viewer-AncillaryComponents m-2 pt-4 px-2">{ancillaryComponents}</VStack>
					</ScrollView>

					{footer}
					{fab}

				</>}
			</VStackNative>;
}

export default withComponent(Viewer);