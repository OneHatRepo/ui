import {
	Text,
} from 'native-base';
import UiGlobals from '../../../UiGlobals.js';
import _ from 'lodash';

function TagViewer(props) {
	const {
			value,
		} = props,
		values = _.map(JSON.parse(value), (val) => {
			return val?.text;
		}),
		styles = UiGlobals.styles;
	return <Text
				numberOfLines={1}
				ellipsizeMode="head" 
				flex={1}
				fontSize={styles.FORM_TEXT_FONTSIZE}
				minHeight='40px'
				px={3}
				py={2}
				{...props}
			>{values.join(', ')}</Text>;
}
export default TagViewer;
