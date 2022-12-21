import Pagination from './Pagination'
import Toolbar from './Toolbar'

export default function PaginationToolbar(props) {
	const {
			Repository
		} = props;
	if (!Repository || !Repository.isPaginated) {
		return null;
	}
	return <Toolbar
				bg="trueGray.300"
				borderTopWidth={1}
				borderTopColor="trueGray.400"
			>
				<Pagination {...props}>
					{props.children}
				</Pagination>
			</Toolbar>;
};
