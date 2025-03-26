import { useEffect, useRef, useState, } from 'react';
import {
	Column,
	Icon,
	ScrollView,
	Row,
	Text,
} from 'native-base';
import {
	EDIT,
} from '../../constants/Commands.js';
import {
	EDITOR_TYPE__SIDE,
} from '../../constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import withComponent from '../Hoc/withComponent.js';
import withPdfButtons from '../Hoc/withPdfButtons.js';
import inArray from '../../functions/inArray.js';
import getComponentFromType from '../../functions/getComponentFromType.js';
import buildAdditionalButtons from '../../functions/buildAdditionalButtons.js';
import testProps from '../../functions/testProps.js';
import Toolbar from '../Toolbar/Toolbar.js';
import Button from '../Buttons/Button.js';
import Label from '../Form/Label.js';
import Pencil from '../Icons/Pencil.js';
import Footer from '../Layout/Footer.js';
import _ from 'lodash';

const CONTAINER_THRESHOLD = 900;

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
			let {
					type,
					title,
					name,
					label,
					items,
					// onChange: onEditorChange,
					useSelectorId = false,
					isHidden = false,
					isHiddenInViewMode = false,
					...propsToPass
				} = item,
				editorTypeProps = {};

			if (isHidden) {
				return null;
			}
			if (isHiddenInViewMode) {
				return null;
			}
			const propertyDef = name && Repository?.getSchema().getPropertyDefinition(name);
			if (!type) {
				if (propertyDef?.viewerType?.type) {
					const
						{
							type: t,
							...p
						} = propertyDef.viewerType;
					type = t
				} else {
					type = 'Text';
				}
			}
			if (type?.match && type.match(/Combo$/) && Repository?.isRemote && !Repository?.isLoaded) {
				editorTypeProps.autoLoad = true;
			}
			if (type?.match(/(Tag|TagEditor)$/)) {
				editorTypeProps.isViewOnly = true;
			}
			const Element = getComponentFromType(type);
			let children;

			if (inArray(type, ['Column', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				if (type === 'Column') {
					if (containerWidth < CONTAINER_THRESHOLD) {
						// everything is in one column
						if (propsToPass.hasOwnProperty('flex')) {
							delete propsToPass.flex;
						}
						if (propsToPass.hasOwnProperty('width')) {
							delete propsToPass.width;
						}
						if (propsToPass.hasOwnProperty('w')) {
							delete propsToPass.w;
						}
						propsToPass.w = '100%';
						propsToPass.mb = 1;
					}
					propsToPass.pl = 3;
				} else if (type === 'FieldSet' && item.showToggleAllCheckbox) {
					propsToPass.showToggleAllCheckbox = false; // don't allow it in view mode
				}
				const itemDefaults = item.defaults || {};
				children = _.map(items, (item, ix) => {
					return buildFromItem(item, ix, {...defaults, ...itemDefaults});
				});
				return <Element key={ix} title={title} {...defaults} {...itemDefaults} {...propsToPass} {...editorTypeProps}>{children}</Element>;
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
			
			let element = <Element
								{...testProps('field-' + name)}
								value={value}
								isEditable={false}
								parent={self}
								reference={name}
								{...propsToPass}
								{...editorTypeProps}
							/>;

			if (item.additionalViewButtons) {
				element = <Row flexWrap="wrap">
								{element}
								{buildAdditionalButtons(item.additionalViewButtons, self)}
							</Row>;
			}

			if (label) {
				const labelProps = {};
				if (defaults?.labelWidth) {
					labelProps.w = defaults.labelWidth;
				}
				element = <><Label {...labelProps}>{label}</Label>{element}</>;
			}
			return <Row key={ix}>{element}</Row>;
		},
		buildAncillary = () => {
			const components = [];
			if (ancillaryItems.length) {
				_.each(ancillaryItems, (item, ix) => {
					let {
						type,
						title = null,
						selectorId = null,
						...propsToPass
					} = item;
					if (isMultiple && type !== 'Attachments') {
						return;
					}
					if (!propsToPass.h) {
						propsToPass.h = 400;
					}
					const
						Element = getComponentFromType(type),
						element = <Element
										{...testProps('ancillary-' + type)}
										selectorId={selectorId}
										selectorSelected={selectorSelected || record}
										selectorSelectedField={selectorSelectedField}
										flex={1}
										h={350}
										canEditorViewOnly={true}
										canCrud={false}
										uniqueRepository={true}
										parent={self}
										{...propsToPass}
										canRowsReorder={false}
									/>;
					if (title) {
						if (record?.displayValue) {
							title += ' for ' + record.displayValue;
						}
						title = <Text
									fontSize={styles.VIEWER_ANCILLARY_FONTSIZE}
									fontWeight="bold"
								>{title}</Text>;
					}
					components.push(<Column key={'ancillary-' + ix} my={5}>{title}{element}</Column>);
				});
			}
			return components;
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
		showCloseBtn = !isSideEditor;
	let additionalButtons = null,
		viewerComponents = null,
		ancillaryComponents = null;
	
	if (containerWidth) { // we need to render this component twice in order to get the container width. Skip this on first render
		additionalButtons = buildAdditionalButtons(additionalViewButtons);
		viewerComponents = buildFromItems();
		ancillaryComponents = buildAncillary();
	}

	let canEdit = true;
	if (canRecordBeEdited && !canRecordBeEdited([record])) {
		canEdit = false;
	}

	return <Column flex={flex} {...testProps(self)} {...props} onLayout={onLayout}>
				{containerWidth && <>

					<ScrollView _web={{ height: 1 }} width="100%" pb={1} ref={scrollViewRef}>
						{canEdit && onEditMode &&
							<Toolbar justifyContent="flex-end">
								<Row flex={1} alignItems="center">
									<Text fontSize={20} ml={2} color="trueGray.500">View Mode</Text>
								</Row>
								{(!canUser || canUser(EDIT)) &&
									<Button
										{...testProps('toEditBtn')}
										key="editBtn"
										onPress={onEditMode}
										leftIcon={<Icon as={Pencil} color="#fff" size="sm" />}	
										color="#fff"
									>To Edit</Button>}
							</Toolbar>}
						{!_.isEmpty(additionalButtons) && 
							<Toolbar justifyContent="flex-end" flexWrap="wrap">
								{additionalButtons}
							</Toolbar>}
						<Column>
							{containerWidth >= CONTAINER_THRESHOLD ? <Row p={4} pl={0}>{viewerComponents}</Row> : null}
							{containerWidth < CONTAINER_THRESHOLD ? <Column p={4}>{viewerComponents}</Column> : null}
							<Column m={2} pt={4}>{ancillaryComponents}</Column>
						</Column>
					</ScrollView>
					{(showDeleteBtn || showCloseBtn) && 
						<Footer justifyContent="flex-end">
							{showDeleteBtn && 
								<Row flex={1} justifyContent="flex-start">
									<Button
										{...testProps('deleteBtn')}
										key="deleteBtn"
										onPress={onDelete}
										bg="warning"
										_hover={{
											bg: 'warningHover',
										}}
										color="#fff"
									>Delete</Button>
								</Row>}
							{onClose && showCloseBtn &&
								<Button
									{...testProps('closeBtn')}
									key="closeBtn"
									onPress={onClose}
									color="#fff"
								>Close</Button>}
						</Footer>}

				</>}
			</Column>;
}

export default withComponent(withPdfButtons(Viewer));