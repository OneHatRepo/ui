import {
	Box,
	Column,
	Row,
} from 'native-base';
import Container from '../Container/Container.js';
import emptyFn from '../../functions/emptyFn.js';
import _ from 'lodash';

export default function EditorWindow(props) {
	const {
			title,
			isOpen = false,
			onClose = emptyFn,
			...propsToPass
		} = props;
	
	
}
