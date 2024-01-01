import CheckboxButton from '../../../Buttons/CheckboxButton.js';
import withComponent from '../../../Hoc/withComponent.js';
import withValue from '../../../Hoc/withValue.js';
import _ from 'lodash';

const
	CheckboxElement = (props) => {
		const {
				value,
				setValue,
			} = props,
			onToggle = () => {
				setValue(!value);
			};

		return <CheckboxButton
					isChecked={value}
					onPress={onToggle}
					_icon={{
						size: 'lg',
					}}
				/>;
	
	},
	CheckboxEField = withComponent(withValue(CheckboxElement));

export default CheckboxEField;
