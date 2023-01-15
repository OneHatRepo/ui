import {
	Row,
} from 'native-base';
import Pagination from './Pagination'
import Toolbar from './Toolbar'
import _ from 'lodash';

export default function PaginationToolbar(props) {
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
				<Pagination {...propsToPass} w={toolbarItems.length ? null : '100%'} />
				{toolbarItems.length ? <Row flex={1} borderLeftWidth={1} borderLeftColor="trueGray.400" pl={3} ml={3}>{toolbarItems}</Row> : null}
			</Toolbar>;
};
