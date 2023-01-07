import { useState, } from 'react';
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

export default function withWindowedEditor(WrappedComponent) {
	return withEditor((props) => {
		const {
				isEditorShown,
				setIsEditorShown,
				...propsToPass
			} = props;

		return <>
			<WrappedComponent {...propsToPass} />
			<Modal
				animationType="fade"
				isOpen={isEditorShown}
				onClose={() => setIsEditorShown(false)}
			>
				<Column bg="#fff" w={500} h={400}>
					<Text>Editor here!</Text>
				</Column>
			</Modal>
		</>;
	});
}