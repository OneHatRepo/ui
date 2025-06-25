import {
	VStack,
} from '@project-components/Gluestack';
import _ from 'lodash';

// This component allows us to stack multiple children in a Container slot (e.g. east)
// such that the ContainerColumn can be passed props like isResizable, 
// which the Container will translate into classNames for the VStack component.

export default function ContainerColumn(props) {
	let className = `
		ContainerColumn
	`;
	if (props.className) {
		className += ` ${props.className}`;
	}
	
	return <VStack className={className}>
				{props.children}
			</VStack>;
}
