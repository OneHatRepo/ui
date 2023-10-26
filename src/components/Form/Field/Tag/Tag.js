import {
	Column,
	Pressable,
	Row,
	Text,
} from 'native-base';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import IconButton from '../../../Buttons/IconButton.js';
import Xmark from '../../../Icons/Xmark.js';
import Combo, { ComboEditor } from '../Combo/Combo.js';
import _ from 'lodash';


function ValueBox(props) {
	const {
			text,
			onDelete,
		} = props;

	return <Row
				borderWidth={1}
				borderColor="trueGray.400"
				borderRadius="md"
				pl={2}
				mr={1}
				bg="trueGray.200"
				alignItems="center"
			>
				<Text color="trueGray.600">{text}</Text>
				<IconButton
					_icon={{
						as: Xmark,
						color: 'trueGray.600',
						size: 'sm',
					}}
					onPress={onDelete}
					h="100%"
				/>
			</Row>;
}

function TagComponent(props) {

	const {
			// withValue
			value = [],
			setValue,
		} = props,
		onAdd = (item, e) => {
			// make sure value doesn't already exist
			let exists = false;
			_.each(value, (val) => {
				if (val.id === item.getId()) {
					exists = true;
					return false; // break
				}
			});

			if (!exists) {
				// add new value
				const newValue = _.clone(value); // so we trigger a re-render
				newValue.push({
					id: item.getId(),
					text: item.getDisplayValue(),
				})
				setValue(newValue);
			}
		},
		onDelete = (val) => {
			// Remove from value array
			const newValue = _.filter(value, (val1) => {
				return val1.id !== val.id;
			});			
			setValue(newValue);
		},
		valueBoxes = _.map(value, (val, ix) => {
			return <ValueBox key={ix} text={val.text} onDelete={() => onDelete(val)} />;
		});

	return <Column w="100%" flex={1}>
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
				<Combo
					{...props}
					disableWithValue={true}
					disableWithSelection={true}
					disableWithEditor={true}
					onRowPress={onAdd}
				/>
			</Column>;
	
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
							withData(
								withValue(
									TagComponent
								)
							)
						)
					);

export const TagEditor = Tag;
// export const TagEditor = withAdditionalProps(ComboEditor);

export default Tag;