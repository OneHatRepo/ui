import { useSelector, useDispatch } from 'react-redux'
import _ from 'lodash';


// Usage example:
// const [
// 		{
// 			user,
// 			isLoading,
// 		},
// 		dispatch
// 	] = useRedux([
// 		'user',
// 		'isLoading',
// 	]);


export default function useRedux(properties) {
	let values = {};
	_.forEach(properties, (property) => {
		values[property] = useSelector((state) => getPropertyFromState(property, state));
	});

	return [
		values,
		useDispatch(),
	];
};

function getPropertyFromState(property, state) {
	let found;
	const reducers = _.keys(state);
	_.each(reducers, (reducer) => {
		if (state[reducer].hasOwnProperty(property)) {
			found = state[reducer][property];
			return false; // break
		}
	});
	return found;
}
