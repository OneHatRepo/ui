import {
	Modal,
} from '@gluestack-ui/themed';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../Constants/Editor.js';
import withSecondaryEditor from './withSecondaryEditor.js';
// import withDraggable from './withDraggable.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withWindowedEditor
// This HOC will eventually get out of sync with that one, and may need to be updated.

export default function withSecondaryWindowedEditor(WrappedComponent, isTree = false) {
	return withSecondaryEditor((props) => {
		const {
				secondaryIsEditorShown = false,
				secondarySetIsEditorShown,
				SecondaryEditor,
				secondaryEditorProps = {},

				// withComponent
				self,
				
				// pull these out, as we don't want them going to the SecondaryEditor
				secondarySelectorId,
				secondarySelectorSelected,
				h,

				...propsToPass
			} = props;

		if (!SecondaryEditor) {
			throw Error('SecondaryEditor is not defined');
		}

		if (secondaryIsEditorShown) {
			// Move the 'secondary' props over to primary
			// for the sake of the Editor
			function lcfirst(str) {
				return str.charAt(0).toLowerCase() + str.slice(1);
			}
			_.each(props, (prop, ix) => {
				if (ix.match(/^secondary/)) {
					const name = lcfirst(ix.replace(/^secondary/, ''));
					secondaryEditorProps[name] = prop;
				}
			});
			secondaryEditorProps.Repository = props.SecondaryRepository;
		}

		return <>
					<WrappedComponent {...props} />
					{secondaryIsEditorShown && 
						<Modal
							isOpen={true}
							onClose={() => secondarySetIsEditorShown(false)}
						>
							<SecondaryEditor
								editorType={EDITOR_TYPE__WINDOWED}
								{...propsToPass}
								{...secondaryEditorProps}
								parent={self}
								reference="secondaryEditor"
							/>
						</Modal>}
				</>;
	}, isTree);
}