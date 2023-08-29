import { useState, } from 'react';
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
			} = props,
			[selection, setSelection] = useState(null);


		if (!Editor) {
			throw Error('Editor is not defined');
		}

		return <Container
					center={<WrappedComponent
								isTree={isTree}
								{...props}
								onSelectionChange={setSelection}	
							/>}
					east={<Editor
								editorType={EDITOR_TYPE__SIDE}
								flex={sideFlex}
								selection={selection} // This needs to be whatever the selection is in the center component
								// {...props}
								{...editorProps}
							/>}
				/>;
	});
}