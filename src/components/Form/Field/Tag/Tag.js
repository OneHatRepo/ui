import {
	Column,
	Pressable,
	Row,
	Text,
} from 'native-base';
import {
	SELECTION_MODE_MULTI,
} from '../../../../Constants/Selection.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import IconButton from '../../../Buttons/IconButton.js';
import Xmark from '../../../Icons/Xmark.js';
import Combo, { ComboEditor } from '../Combo/Combo.js';


function ValueBox(props) {
	const {
			text,
			onDelete,
		} = props;

	return <Row
				borderWidth={1}
				borderColor="trueGray.800"
				borderRightRadius="md"
				p={1}
				m={1}
				bg="trueGray.200"
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
			value,

			// withComponent
			self,
		} = props,
		onAdd = (item, e) => {
			// Add to value array

			// make sure value doesn't already exist



		},
		onDelete = () => {
			// Remove from value array

		},
		getValues = () => {
			// value

			return []
		},
		values = getValues(),
		valueBoxes = _.map(values, (value, ix) => {

			// determine text
			const text = '';


			return <ValueBox key={ix} text={text} onDelete={onDelete} />;
		});

	return <Column w="100%" flex={1}>
				<Row
					w="100%"
					borderWidth={1}
					borderColor="trueGray.800"
					borderRightRadius="md"
					p={1}
					mb={1}
				>{valueBoxes}</Row>
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
					valueIsAlwaysArray={true}
					valueAsIdAndText={true}
					valueAsStringifiedJson={true}
					{...props}
				/>;
	};
}

export const Tag = withAdditionalProps(
						withComponent(
							withData(
								withValue(
									withSelection(
										TagComponent
									)
								)
							)
						)
					);

export const TagEditor = Tag;
// export const TagEditor = withAdditionalProps(ComboEditor);

export default Tag;