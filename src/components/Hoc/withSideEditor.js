import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import Container from '../Container/Container.js';
import withEditor from './withEditor.js';
import _ from 'lodash';


export default function withSideEditor(WrappedComponent, isTree = false) {
	return withEditor((props) => {
		const {
				Editor,
				editorProps = {},
				sideFlex = 100,

				// withComponent
				self: parent,
				
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
								parent={parent}
							/>}
				/>;
	});
}