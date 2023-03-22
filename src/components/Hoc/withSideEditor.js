import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import Container from '../Container/Container.js';
import withEditor from './withEditor.js';
import _ from 'lodash';


export default function withSideEditor(WrappedComponent) {
	return withEditor((props) => {
		const {
				EditorWindow,
				editorProps = {},
			} = props;

		return <Container
					center={<WrappedComponent {...props} />}
					east={<EditorWindow
								editorType={EDITOR_TYPE__SIDE}
								{...props}
								{...editorProps}
							/>}
				/>;
	});
}