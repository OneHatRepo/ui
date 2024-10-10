import { useRef, } from 'react';
import {
	Button,
	ButtonText,
} from '@gluestack-ui/themed';
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
		return <Button ref={buttonRef} {...props}>
					<ButtonText>{text}</ButtonText>
				</Button>;
	}

	return <Button ref={buttonRef} {...props} />;
}

export default withComponent(ButtonComponent);