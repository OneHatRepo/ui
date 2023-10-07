import {
	Button,
} from 'native-base';
import withComponent from '../Hoc/withComponent.js';

const ButtonComponent = function(props) {
	return <Button {...props} />;
}

export default withComponent(ButtonComponent);