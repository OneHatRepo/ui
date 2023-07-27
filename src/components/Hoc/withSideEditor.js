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
				sideFlex = 100,
			} = props;

		if (!Editor) {
			throw Error('Editor is not defined');
		}

		return <Container
					center={<WrappedComponent {...props} />}
					east={<Editor
								editorType={EDITOR_TYPE__SIDE}
								flex={sideFlex}
								{...props}
								{...editorProps}
							/>}
				/>;
	});
}