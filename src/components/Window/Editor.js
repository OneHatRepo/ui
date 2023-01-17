import {
	Box,
	Column,
	Row,
} from 'native-base';
import Container from '../Container/Container';
import emptyFn from '../../Functions/emptyFn';
import _ from 'lodash';

export default function EditorWindow(props) {
	const {
			title,
			isOpen = false,
			onClose = emptyFn,
			...propsToPass
		} = props;
	
	
}
