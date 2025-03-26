import {
	EDITOR_TYPE__SIDE,
} from '../../../constants/Editor.js';
import Container from '../../Container/Container.js';
import withSecondaryEditor from './withSecondaryEditor.js';
import _ from 'lodash';

// NOTE: This is a modified version of @onehat/ui/src/Hoc/withSideEditor
// This HOC will eventually get out of sync with that one, and may need to be updated.


function withAdditionalProps(WrappedComponent) {
	return (props) => {
		// provide the editorType to withEditor
		return <WrappedComponent
					editorType={EDITOR_TYPE__SIDE}
					{...props}
				/>;
	};
}

// NOTE: Effectivtly, the HOC composition is:
// withAdditionalProps(withSecondaryEditor(withSecondarySideEditor))

export default function withSecondarySideEditor(WrappedComponent, isTree = false) {
	return withAdditionalProps(withSecondaryEditor((props) => {
		const {
				SecondaryEditor,
				secondaryEditorProps = {},
				secondarySideFlex = 100,

				// withComponent
				self,
				
				// pull these out, as we don't want them going to the Editor
				secondarySelectorId,
				secondarySelectorSelected,
				secondarySelectorSelectedField,
				
				...propsToPass
			} = props;

		if (!SecondaryEditor) {
			throw Error('SecondaryEditor is not defined');
		}

		return <Container
					center={<WrappedComponent
								isTree={isTree}
								isSideEditor={true}
								{...props}
							/>}
					east={<Editor
								{...propsToPass}
								editorType={EDITOR_TYPE__SIDE}
								flex={secondarySideFlex}
								borderLeftWidth={1}
								borderLeftColor="#ccc"
								{...secondaryEditorProps}
								parent={self}
								reference="secondaryEditor"
							/>}
				/>;
	}));
}