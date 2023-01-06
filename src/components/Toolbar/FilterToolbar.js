import {
	Row,
} from 'native-base';
import Toolbar from './Toolbar'
import _ from 'lodash';

export default function FilterToolbar(props) {
	const {
			toolbarItems = [],
		} = props,
		propsToPass = _.omit(props, 'toolbarItems');
	return <Toolbar
				bg="trueGray.200"
				borderTopWidth={1}
				borderTopColor="trueGray.400"
				w="100%"
			>
				{toolbarItems.length ? <Row flex={1} borderLeftWidth={1} borderLeftColor="trueGray.100">{toolbarItems}</Row> : null}
			</Toolbar>;
};
