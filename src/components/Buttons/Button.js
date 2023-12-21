import { useRef, } from 'react';
import {
	Button,
} from 'native-base';
import withComponent from '../Hoc/withComponent.js';

const ButtonComponent = function(props) {
	const {
			self,
		} = props,
		buttonRef = useRef();
	
	if (self) {
		self.ref = buttonRef.current;
	}

	return <Button ref={buttonRef} {...props} />;
}

export default withComponent(ButtonComponent);