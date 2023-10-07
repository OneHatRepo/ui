import {
	EDITOR_MODE__VIEW,
} from '../../Constants/Editor.js';
import withComponent from '../Hoc/withComponent.js';
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
			editorMode,
			onEditMode,
			_viewer = {},
			_form = {},

			// withComponent
			self: parent,

			// withSelection
			selection,

		} = props;

	if (_.isEmpty(selection)) {
		return null; // hide the editor when no selection
	}

	// Repository?.isRemotePhantomMode && selection.length === 1 && 
	if (editorMode === EDITOR_MODE__VIEW) {
		const record = selection[0];
		if (record.isDestroyed) {
			return null;
		}
		return <Viewer
					{...props}
					record={record}
					onEditMode={isEditorViewOnly ? null : onEditMode}
					onClose={onClose}
					onDelete={onDelete}
					parent={parent}
					reference="viewer"
					{..._viewer}
				/>;
	}

	return <Form
				{...props}
				record={selection}
				onCancel={onCancel}
				onSave={onSave}
				onClose={onClose}
				onDelete={onDelete}
				parent={parent}
				reference="form"
				{..._form}
			/>;
}

export default withComponent(Editor);