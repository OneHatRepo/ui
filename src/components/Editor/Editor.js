import {
	EDITOR_MODE__VIEW,
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import withComponent from '../Hoc/withComponent.js';
import withPdfButtons from '../Hoc/withPdfButtons.js';
import Form from '../Form/Form.js';
import Viewer from '../Viewer/Viewer.js';
import _ from 'lodash';

function Editor(props) {
	const {
			isEditorViewOnly,
			onEditorCancel: onCancel,
			onEditorSave: onSave,
			onEditorClose: onClose,
			onEditorDelete: onDelete,
			getEditorMode = () => {
				return props.editorMode;
			},
			onEditMode,
			canRecordBeEdited,
			_viewer = {},
			_form = {
				containerProps: {}
			},

			// withComponent
			self,

			// withSelection
			selection,

		} = props;

	if (_.isEmpty(selection)) {
		return null; // hide the editor when no selection
	}

	const propsToPass = _.omit(props, ['self', 'reference', 'parent', 'style']);
	if (propsToPass.editorType === EDITOR_TYPE__SIDE) {
		propsToPass.style = props.style; // side editor needs the style prop, but a windowed editor can get messed up if it's present (and withModal is used)!
	}

	let canEdit = true;
	if (canRecordBeEdited && !canRecordBeEdited(selection)) {
		canEdit = false;
	}
	
	// Repository?.isRemotePhantomMode && selection.length === 1 && 
	if (getEditorMode() === EDITOR_MODE__VIEW || isEditorViewOnly || !canEdit) {
		const record = selection[0];
		if (record.isDestroyed) {
			return null;
		}
		return <Viewer
					{...propsToPass}
					{..._viewer}
					record={record}
					onEditMode={isEditorViewOnly ? null : onEditMode}
					onClose={onClose}
					onDelete={onDelete}
					parent={self}
					reference="viewer"
				/>;
	}

	return <Form
				{...propsToPass}
				{..._form}
				record={selection}
				onCancel={onCancel}
				onSave={onSave}
				onClose={onClose}
				onDelete={onDelete}
				parent={self}
				reference="form"
			/>;
}

export default withComponent(withPdfButtons(Editor));