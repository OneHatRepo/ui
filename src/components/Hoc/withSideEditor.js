import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import Container from '../Container/Container.js';
import withEditor from './withEditor.js';
import _ from 'lodash';


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
// withAdditionalProps(withEditor(withSideEditor))

export default function withSideEditor(WrappedComponent, isTree = false) {
	const SideEditor = (props) => {
		const {
				Editor,
				editorProps = {},
				sideFlex = 100,

				// withComponent
				self,
				
				// pull these out, as we don't want them going to the Editor
				selectorId,
				selectorSelected,
				
				...propsToPass
			} = props;

		if (!Editor) {
			throw Error('Editor is not defined');
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
								flex={sideFlex}
								borderLeftWidth={1}
								borderLeftColor="#ccc"
								{...editorProps}
								parent={self}
								reference="editor"
							/>}
				/>;
	};
	return withAdditionalProps(withEditor(SideEditor));
}