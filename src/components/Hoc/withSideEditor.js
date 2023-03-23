import {
	EDITOR_TYPE__SIDE,
} from '../../Constants/Editor.js';
import Container from '../Container/Container.js';
import withEditor from './withEditor.js';
import _ from 'lodash';


export default function withSideEditor(WrappedComponent) {
	return withEditor((props) => {
		const {
				Editor,
				editorProps = {},
			} = props;

		return <Container
					center={<WrappedComponent {...props} />}
					east={<Editor
								editorType={EDITOR_TYPE__SIDE}
								{...props}
								{...editorProps}
							/>}
				/>;
	});
}