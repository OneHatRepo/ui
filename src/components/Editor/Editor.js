import {
	EDITOR_MODE__VIEW,
} from '../../Constants/Editor.js';
import Form from '../Form/Form.js';
import Viewer from '../Viewer/Viewer.js';
import _ from 'lodash';

export default function Editor(props) {
	const {
			isEditorViewOnly,
			onEditorCancel: onCancel,
			onEditorSave: onSave,
			onEditorClose: onClose,
			onEditorDelete: onDelete,
			editorMode,
			onEditMode,

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
				/>;
	}

	return <Form
				{...props}
				record={selection}
				onCancel={onCancel}
				onSave={onSave}
				onClose={onClose}
				onDelete={onDelete}
			/>;
}
