import { useRef, } from 'react';
import {
	Button,
} from 'native-base';
import withComponent from '../Hoc/withComponent.js';

const ButtonComponent = function(props) {
	const {
			self,
			text,
		} = props,
		buttonRef = useRef();
	
	if (self) {
		self.ref = buttonRef.current;
	}

	if (text) {
		return <Button ref={buttonRef} {...props}>{text}</Button>;
	}

	return <Button ref={buttonRef} {...props} />;
}

export default withComponent(ButtonComponent);