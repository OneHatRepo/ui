import {
	EDITOR_MODE__VIEW,
	EDITOR_MODE__ADD,
	EDITOR_MODE__EDIT,
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
			editorMode,
			setEditorMode,

			// withData
			Repository,

			// withSelection
			selection,

		} = props,
		onEditMode = () => {
			setEditorMode(EDITOR_MODE__EDIT);
		},
		onBack = () => {
			setEditorMode(EDITOR_MODE__VIEW);
		};

	if (_.isEmpty(selection)) {
		return null;
	}

	if (Repository.isRemotePhantomMode && selection.length === 1 && editorMode === EDITOR_MODE__VIEW) {
		return <Viewer
					record={selection[0]}
					Repository={Repository}
					onEditMode={isViewOnly ? null : onEditMode}
					{...props}
				/>;
	}

	// NOTE: Ideally, this form should use multiple columns when screen is wide enough,
	// and only show in one column when it's not.

	return <Form
				record={selection}
				onBack={onBack}
				onCancel={onCancel}
				onSave={onSave}
				onClose={onClose}
				{...props}
			/>;
}