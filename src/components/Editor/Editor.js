import {
	EDITOR_MODE__VIEW,
} from '../../Constants/Editor.js';
import _ from 'lodash';


export default function Editor(props) {
	const {
			Form,
			Viewer,
			isEditorViewOnly: isViewOnly,
			onEditorCancel: onCancel,
			onEditorSave: onSave,
			onEditorClose: onClose,
			onEditorDelete: onDelete,
			editorMode,

			// withData
			Repository,

			// withSelection
			selection,

		} = prop;

	if (_.isEmpty(selection)) {
		return null;
	}

	if (Repository.isRemotePhantomMode && selection.length === 1 && editorMode === EDITOR_MODE__VIEW) {
		return <Viewer
					{...props}
					record={selection[0]}
					onEditMode={isViewOnly ? null : onEditMode}
					onClose={onClose}
					// onDelete={onDelete}
				/>;
	}

	// NOTE: Ideally, this form should use multiple columns when screen is wide enough,
	// and only show in one column when it's not.

	return <Form
				{...props}
				record={selection}
				onCancel={onCancel}
				onSave={onSave}
				onClose={onClose}
				onDelete={onDelete}
			/>;
}
