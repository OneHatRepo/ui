import { useRef, useState, } from 'react';
import {
	Column,
	Icon,
	ScrollView,
	Row,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import UiGlobals from '../../UiGlobals.js';
import withComponent from '../Hoc/withComponent.js';
import withPdfButton from '../Hoc/withPdfButton.js';
import inArray from '../../Functions/inArray.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import buildAdditionalButtons from '../../Functions/buildAdditionalButtons.js';
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
			verifyCanEdit,

			// withComponent
			self,

			// withData
			Repository,

			// withEditor
			editorType,
			onEditMode,
			onClose,
			onDelete,

			// parent container
			selectorId,
			selectorSelected,

		} = props,
		scrollViewRef = useRef(),
		isMultiple = _.isArray(record),
		[containerWidth, setContainerWidth] = useState(),
		isSideEditor = editorType === EDITOR_TYPE__SIDE,
		styles = UiGlobals.styles,
		flex = props.flex || 1,
		buildFromItems = () => {
			const builtItems = [];
			_.each(items, (item, ix) => {
				if (!item) {
					return;
				}
				const builtItem = buildFromItem(item, ix, columnDefaults);
				builtItems.push(builtItem);
			});
			return builtItems;
		},
		buildFromItem = (item, ix, defaults) => {
			let {
					type,
					title,
					name,
					label,
					items,
					// onChange: onEditorChange,
					useSelectorId = false,
					isHiddenInViewMode = false,
					...propsToPass
				} = item,
				editorTypeProps = {};

			if (isHiddenInViewMode) {
				return;
			}
			const propertyDef = name && Repository?.getSchema().getPropertyDefinition(name);
			if (!type) {
				if (propertyDef?.viewerType) {
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
			if (type.match(/(Tag|TagEditor)$/)) {
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
				}
				const defaults = item.defaults;
				children = _.map(items, (item, ix) => {
					return buildFromItem(item, ix, defaults);
				});
				return <Element key={ix} title={title} {...defaults} {...propsToPass} {...editorTypeProps}>{children}</Element>;
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
										selectorId={selectorId}
										selectorSelected={selectorSelected || record}
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
	if (verifyCanEdit && !verifyCanEdit([record])) {
		canEdit = false;
	}

	return <Column flex={flex} {...props} onLayout={onLayout}>
				{containerWidth && <>

					<ScrollView _web={{ height: 1 }} width="100%" pb={1} ref={scrollViewRef}>
						{canEdit && onEditMode &&
							<Row px={4} pt={4} alignItems="center" justifyContent="flex-end">
								<Button
									key="editBtn"
									onPress={onEditMode}
									leftIcon={<Icon as={Pencil} color="#fff" size="sm" />}	
									color="#fff"
								>To Edit</Button>
							</Row>}
						{!_.isEmpty(additionalButtons) && 
							<Row p={4} alignItems="center" justifyContent="flex-end" flexWrap="wrap">
								{additionalButtons}
							</Row>}
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
									key="closeBtn"
									onPress={onClose}
									color="#fff"
								>Close</Button>}
						</Footer>}

				</>}
			</Column>;
}

export default withComponent(withPdfButton(Viewer));