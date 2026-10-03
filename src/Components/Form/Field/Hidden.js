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
		} = props,
		testIdProps = testID ? testProps(testID) : {},
		domSafeTestProps = testIdProps.testID ? { 'data-testid': testIdProps.testID } : testIdProps;

	return <input
				{...domSafeTestProps}
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