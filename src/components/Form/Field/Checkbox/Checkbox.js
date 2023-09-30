import CheckboxButton from '../../../Buttons/CheckboxButton.js';
import withValue from '../../Hoc/withValue.js';
import _ from 'lodash';

const
	CheckboxElement = (props) => {
		const {
				value,
				setValue,
			} = props,
			onToggle = () => {
				if (!isBlocked.current) {
					setValue(!value);
				}
			};

		return <CheckboxButton
					isChecked={value}
					onPress={onToggle}
				/>;
	
	},
	CheckboxEField = withValue(CheckboxElement);

export default CheckboxEField;
