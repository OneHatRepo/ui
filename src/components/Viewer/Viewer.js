import { useRef, } from 'react';
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
		isSideEditor = editorType === EDITOR_TYPE__SIDE,
		styles = UiGlobals.styles,
		flex = props.flex || 1,
		buildFromItems = () => {
			return _.map(items, (item, ix) => buildNextLayer(item, ix, columnDefaults));
		},
		buildNextLayer = (item, ix, defaults) => {
			let {
					type,
					title,
					name,
					label,
					items,
					// onChange: onEditorChange,
					useSelectorId = false,
					...propsToPass
				} = item,
				editorTypeProps = {};

			const propertyDef = name && Repository?.getSchema().getPropertyDefinition(name);
			if (!type) {
				if (propertyDef.viewerType) {
					const
						{
							type: t,
							...p
						} =  propertyDef.viewerType;
					type = t
				} else {
					type = 'Text';
				}
			}
			if (type?.match && type.match(/Combo$/) && Repository?.isRemote && !Repository?.isLoaded) {
				editorTypeProps.autoLoad = true;
			}
			const Element = getComponentFromType(type);
			let children;

			if (inArray(type, ['Column', 'FieldSet'])) {
				if (_.isEmpty(items)) {
					return null;
				}
				const defaults = item.defaults;
				children = _.map(items, (item, ix) => {
					return buildNextLayer(item, ix, defaults);
				});
				return <Element key={ix} title={title} {...defaults} {...propsToPass} {...editorTypeProps}>{children}</Element>;
			}

			if (!label && Repository && propertyDef.title) {
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
										uniqueRepository={true}
										parent={self}
										{...propsToPass}
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
		buildAdditionalButtons = (configs) => {
			const additionalButtons = [];
			_.each(additionalViewButtons, (config) => {
				const {
						key,
						text,
						handler,
						icon,
						isDisabled,
						color = '#fff',
					} = config,
					buttonProps = {};
				if (key) {
					buttonProps.key = key;
					buttonProps.reference = key;
				}
				if (handler) {
					buttonProps.onPress = handler;
				}
				if (icon) {
					buttonProps.leftIcon = <Icon as={icon} color="#fff" size="sm" />;
				}
				if (isDisabled) {
					buttonProps.isDisabled = isDisabled;
				}
				
				const button = <Button
									color={color}
									ml={2}
									parent={self}
									reference={key}
									{...buttonProps}
								>{text}</Button>;
				additionalButtons.push(button);
			});
			return additionalButtons;
		};

	if (self) {
		self.ref = scrollViewRef;
	}

	const
		showDeleteBtn = onDelete && viewerCanDelete,
		showCloseBtn = !isSideEditor,
		additionalButtons = buildAdditionalButtons();

	return <Column flex={flex} {...props}>
				<ScrollView width="100%" _web={{ height: 1 }} ref={scrollViewRef}>
					<Column p={4}>
						{onEditMode && <Row mb={4} justifyContent="flex-end">
											<Button
												key="editBtn"
												onPress={onEditMode}
												leftIcon={<Icon as={Pencil} color="#fff" size="sm" />}	
												color="#fff"
											>To Edit</Button>
										</Row>}
						
						{!_.isEmpty(additionalButtons) && 
							<Row p={2} alignItems="center" justifyContent="flex-end">
								{additionalButtons}
							</Row>}

						{buildFromItems()}

						{buildAncillary()}

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
						{showCloseBtn && <Button
											key="closeBtn"
											onPress={onClose}
											color="#fff"
										>Close</Button>}
					</Footer>}
			</Column>;
}

export default withComponent(withPdfButton(Viewer));