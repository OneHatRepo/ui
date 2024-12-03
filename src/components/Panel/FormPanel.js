import {
	Text,
} from '@project-components/Gluestack';
import Panel from './Panel.js';
import Form, { FormEditor } from '../Form/Form.js';
import withData from '../Hoc/withData.js';
import _ from 'lodash';

export function FormPanel(props) {
	const {
			instructions,
			isEditor = false,
			_panel = {},
			_form = {},
		} = props,
		WhichForm = isEditor ? FormEditor : Form;

	let formClassName = _form.className || '';
	formClassName += ' px-3 pt-6';

	return <Panel isCollapsible={false} {...props} {..._panel}>
				{instructions && <Text className="px-5 pt-3 italic-italic">{instructions}</Text>}
				<WhichForm {...props} {..._form} className={formClassName} />
			</Panel>;
}

export default withData(FormPanel);
