import _ from 'lodash';

export default function withBlank(WrappedComponent) {
	return (props) => {
		const {

			} = props;
		return <WrappedComponent {...props} />;
	};
}