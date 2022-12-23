import React, { useState, useEffect, } from 'react';
import {
	Column,
	Icon,
	Modal,
	Pressable,
	Row,
	Text,
} from 'native-base';
import withEditor from './withEditor';
import _ from 'lodash';

export default function withInlineEditor(WrappedComponent) {
	return withEditor((props) => {
		const {
				// extract and pass
				isEditorShown,
				setIsEditorShown,
				editorItems,
				onEditorSave,
				onEditorCancel,
				...propsToPass
			} = props,
			{
				// for local use
				selection,
				setSelection, // in case it's ever needed!
			} = props,
			[editorX, setEditorX] = useState(0),
			[editorY, setEditorY] = useState(0),
			[editorComponents, setEditorComponents] = useState([]);

			// onShowEditor = (entity, rowIx, e, selection, setSelection) => {
			// 	if (!selection.length && entity) {
			// 		// No current selections, so select this row so operations apply to it
			// 		setSelection([rowIx]);
			// 	}
				
			// 	setIsEditorShown(true);
			// 	setEditorX(e.pageX);
			// 	setEditorY(e.pageY);
			// };

			useEffect(() => {
				const editorComponents = _.map(editorItems, (config, ix) => {
					// let {
					// 	text,
					// 	handler,
					// 	icon = null,
					// 	isDisabled = false,
					// } = config;
					
					// if (icon) {
					// 	const iconProps = {
					// 		alignSelf: 'center',
					// 		size: 'sm',
					// 		color: isDisabled ? 'disabled' : 'trueGray.800',
					// 		h: 20,
					// 		w: 20,
					// 		mr: 2,
					// 	};
					// 	icon = React.cloneElement(icon, {...iconProps});
					// }
					// return <Pressable
					// 			key={ix}
					// 			onPress={() => {
					// 				setIsEditorShown(false);
					// 				handler();
					// 			}}
					// 			flexDirection="row"
					// 			borderBottomWidth={1}
					// 			borderBottomColor="trueGray.200"
					// 			py={2}
					// 			px={4}
					// 			_hover={{
					// 				bg: '#ffc',
					// 			}}
					// 			isDisabled={isDisabled}
					// 		>
					// 			{icon}
					// 			<Text flex={1} color={isDisabled ? 'disabled' : 'trueGray.800'}>{text}</Text>
					// 		</Pressable>;
				});
				setEditorComponents(editorComponents);
			}, [editorItems]);
	
		return <>
			<WrappedComponent {...propsToPass} />
			<Modal
				animationType="fade"
				isOpen={isEditorShown}
				onClose={onEditorCancel}
			>
				<Column bg="#fff" w={500} h={400}>
					<Text>Editor here!</Text>
				</Column>
			</Modal>
		</>;
	});
}