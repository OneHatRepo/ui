
import withInlineEditor from './withInlineEditor.js';
import withSideEditor from './withSideEditor.js';


export default function withInlineSideEditor(WrappedComponent) {
	throw Error('Not yet implemented');
	return withSideEditor(withInlineEditor(WrappedComponent, true));
}