import {
	Column,
	Modal,
	Text,
} from 'native-base';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../Constants/Editor.js';
import withEditor from './withEditor.js';
// import withDraggable from './withDraggable.js';
import _ from 'lodash';


// function withAdditionalProps(WrappedComponent) {
// 	return (props) => {
// 		return <WrappedComponent
// 					mode="BOTH_AXES"
// 					handle=".header"
// 					{...props}
// 				/>;
// 	};
// }

// In order to implement a draggable window, I'd need to switch the Column with DraggableColumn,
// then switch position to absolute, draggable area would be header of panel
// const DraggableColumn = withAdditionalProps(withDraggable(Column));




function withAdditionalProps(WrappedComponent) {
	return (props) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					editorType={EDITOR_TYPE__WINDOWED}
					{...props}
				/>;
	};
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withEditor(withWindowedEditor))

export default function withWindowedEditor(WrappedComponent, isTree = false) {
	return withAdditionalProps(withEditor((props) => {
		const {
				isEditorShown = false,
				setIsEditorShown,
				Editor,
				editorProps = {},

				// withComponent
				self,
				
				// pull these out, as we don't want them going to the Editor
				selectorId,
				selectorSelected,
				h,

				...propsToPass
			} = props,
			onEditorCancel = props.onEditorCancel;

		if (!Editor) {
			throw Error('Editor is not defined');
		}

		return <>
					<WrappedComponent {...props} />
					{isEditorShown && 
						<Modal
							isOpen={true}
							onClose={onEditorCancel}
						>
							<Editor
								editorType={EDITOR_TYPE__WINDOWED}
								{...propsToPass}
								{...editorProps}
								parent={self}
								reference="editor"
							/>
						</Modal>}
				</>;
	}, isTree));
}