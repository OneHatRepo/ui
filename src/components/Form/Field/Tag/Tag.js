import { useState, } from 'react';
import {
	Column,
	Modal,
	Row,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE__WINDOWED,
} from '@onehat/ui/src/Constants/Editor.js';
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import IconButton from '../../../Buttons/IconButton.js';
import Eye from '../../../Icons/Eye.js';
import Xmark from '../../../Icons/Xmark.js';
import Combo, { ComboEditor } from '../Combo/Combo.js';
import _ from 'lodash';


function ValueBox(props) {
	const {
			text,
			onView,
			onDelete,
		} = props;

	return <Row
				borderWidth={1}
				borderColor="trueGray.400"
				borderRadius="md"
				mr={1}
				bg="trueGray.200"
				alignItems="center"
			>
				<IconButton
					_icon={{
						as: Eye,
						color: 'trueGray.600',
						size: 'sm',
					}}
					onPress={onView}
					h="100%"
				/>
				<Text color="trueGray.600">{text}</Text>
				{onDelete &&
					<IconButton
						_icon={{
							as: Xmark,
							color: 'trueGray.600',
							size: 'sm',
						}}
						onPress={onDelete}
						h="100%"
					/>}
			</Row>;
}

function TagComponent(props) {

	const {
			isEditor = false,
			isValueAlwaysArray,
			isValueAsStringifiedJson,
			Editor,

			// parent Form
			onChangeValue,

			// withComponent
			self,

			// withValue
			value = [],
			setValue,
			...propsToPass // break connection between Tag and Combo props
		} = props,
		[isViewerShown, setIsViewerShown] = useState(false),
		[viewerSelection, setViewerSelection] = useState(false),
		onViewerClose = () => setIsViewerShown(false),
		onView = async (item, e) => {
			const
				id = item.id,
				repository = propsToPass.Repository;
			let record = repository.getById(id); // first try to get from entities in memory
			if (!record && repository.getSingleEntityFromServer) {
				record = await repository.getSingleEntityFromServer(id); // TODO: Build this
			}

			if (!record) {
				alert('Record could not be found!');
				return;
			}

			setViewerSelection([record]);
			setIsViewerShown(true);
		},
		onAdd = (item, e) => {
			// make sure value doesn't already exist
			let exists = false;
			_.each(value, (val) => {
				if (val.id === item.getId()) {
					exists = true;
					return false; // break
				}
			});
			if (exists) {
				alert('Value already exists!');
				return;
			}

			// add new value
			const newValue = _.clone(value); // so we trigger a re-render
			newValue.push({
				id: item.getId(),
				text: item.getDisplayValue(),
			})
			setValue(newValue);
		},
		onDelete = (val) => {
			// Remove from value array
			const newValue = _.filter(value, (val1) => {
				return val1.id !== val.id;
			});			
			setValue(newValue);
		},
		valueBoxes = _.map(value, (val, ix) => {
			return <ValueBox
						key={ix}
						text={val.text}
						onView={() => onView(val)}
						onDelete={isEditor ? () => onDelete(val) : null}
					/>;
		}),
		WhichCombo = isEditor ? ComboEditor : Combo;

	return <>
				<Column w="100%" flex={1}>
					{!_.isEmpty(valueBoxes) && 
						<Row
							w="100%"
							borderWidth={1}
							borderColor="trueGray.300"
							borderRadius="md"
							bg="trueGray.100"
							p={1}
							mb={1}
							flexWrap="wrap"
						>{valueBoxes}</Row>}
					<WhichCombo
						Repository={props.Repository}
						Editor={props.Editor}
						onRowPress={onAdd}
					/>
				</Column>
				{isViewerShown && 
					<Modal
						isOpen={true}
						onClose={onViewerClose}
					>
						<Editor
							editorType={EDITOR_TYPE__WINDOWED}
							{...propsToPass}
							parent={self}
							reference="viewer"

							isEditorViewOnly={true}
							selection={viewerSelection}
							onEditorClose={onViewerClose}
						/>
					</Modal>}
			</>;
	
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					isValueAlwaysArray={true}
					isValueAsStringifiedJson={true}
					{...props}
				/>;
	};
}

export const Tag = withAdditionalProps(
						withComponent(
							withAlert(
								withData(
									withValue(
										TagComponent
									)
								)
							)
						)
					);

function withAdditionalEditorProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					isEditor={true}
					isValueAlwaysArray={true}
					isValueAsStringifiedJson={true}
					{...props}
				/>;
	};
}

export const TagEditor = withAdditionalEditorProps(
							withComponent(
								withAlert(
									withData(
										withValue(
											TagComponent
										)
									)
								)
							)
						);

export default Tag;