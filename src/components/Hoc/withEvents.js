import {
} from 'native-base';
import _ from 'lodash';

export default function withEvents(WrappedComponent) {
	return (props) => {
		const {
				onEvent,
			} = props;
		return <WrappedComponent fireEvent={onEvent} {...props} />;
	};
}