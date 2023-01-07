import {
	Text,
} from 'native-base';
import Panel from './Panel';
import Form from '../Form/Form';
import _ from 'lodash';

export default function FormPanel(props) {
	const {
		instructions,
		_panel = {},
		_form = {},
	} = props;
	return <Panel isCollapsible={false} {...props} {..._panel}>
				{instructions && <Text px={5} pt={3} fontStyle="italic">{instructions}</Text>}
				<Form px={3} pt={6} {...props} {..._form}/>
			</Panel>;
}
