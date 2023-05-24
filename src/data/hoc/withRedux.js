import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

let actionCreators = null;

export function setActionCreators(ac) {
	actionCreators = ac;
}

// Usage:
// At top of file: 
// import withRedux from '../../OneHat/Data/hoc/WithData';
// 
// At the bottom of your component that needs a CrudStore, do this:
// export default withRedux(MyComponent, ['Users', 'Equipment']);

export default function withRedux(WrappedComponent, properties = null) {
	
	if (_.isString(properties)) {
		properties = [properties];
	}

	function WrapperComponent(props) {
		return <WrappedComponent {...props} />;
	}

	// What portion of the global Redux state should be routed to this component as props?
	function mapStateToProps(state) {
		let obj = {};
		const reducers = _.keys(state);
		_.forEach(properties, (property) => {
			_.forEach(reducers, (reducer) => {
				if (state[reducer].hasOwnProperty(property)) {
					obj[property] = state[reducer][property];
				}
			});
		});
		return obj;
	}

	// Pass action creators down to a component as props,
	// so the component doesn't have to directly make use of Redux or store.dispatch()
	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actionCreators, dispatch)
		};
	}

	// Create "Reduxed" HOC so everything connects together correctly
	return connect(mapStateToProps, mapDispatchToProps)( WrapperComponent );

}