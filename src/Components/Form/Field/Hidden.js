import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';
import testProps from '../../../Functions/testProps.js';
import _ from 'lodash';

const HiddenElement = (props) => {
	const {
			value,
			setValue,
			name,
			testID,
		} = props;

	return <input
				{...(testID ? testProps(testID) : {})}
				type="hidden"
				data-hidden-input="true"
				name={name}
				value={_.isNil(value) ? '' : String(value)}
				onChange={(e) => {
					const nextValue = e.target.value;
					setValue(nextValue === '' ? null : nextValue);
				}}
			/>;
};

export default withComponent(withValue(HiddenElement));