import {
	Text,
} from 'native-base';
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
	return <Panel isCollapsible={false} {...props} {..._panel}>
				{instructions && <Text px={5} pt={3} fontStyle="italic">{instructions}</Text>}
				<WhichForm px={3} pt={6} {...props} {..._form}/>
			</Panel>;
}

export default withData(FormPanel);
